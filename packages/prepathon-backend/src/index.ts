import CredentialsProvider from '@auth/core/providers/credentials';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import data, { CompanyData, YearlyData } from '../data';
import * as schema from './schema';
import { deserializePasskey, serializePasskey } from './utils/convert';

interface Bindings {
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    AUTH_GITHUB_ID: string;
    AUTH_GITHUB_SECRET: string;
    AUTH_SECRET: string;
    DB: D1Database;
    GEMINI_API_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use(
    '*',
    cors({
        origin: (origin) => origin,
        allowHeaders: ['Content-Type'],
        allowMethods: ['*'],
        maxAge: 86400,
        credentials: true,
    })
);

app.use(
    '*',
    initAuthConfig((c) => ({
        secret: c.env.AUTH_SECRET,
        providers: [
            Google({
                clientId: c.env.AUTH_GOOGLE_ID,
                clientSecret: c.env.AUTH_GOOGLE_SECRET,
            }),
            GitHub({
                clientId: c.env.AUTH_GITHUB_ID,
                clientSecret: c.env.AUTH_GITHUB_SECRET,
            }),
            CredentialsProvider({
                name: 'credentials',
                credentials: {
                    email: { label: 'Email', type: 'text' },
                    password: { label: 'Password', type: 'password' },
                },
                authorize: async (credentials) => {
                    const db = drizzle(c.env.DB);
                    const user = await db
                        .select()
                        .from(schema.users)
                        .where(
                            eq(schema.users.email, credentials.email as string)
                        )
                        .get();

                    if (
                        user &&
                        user.password &&
                        bcrypt.compareSync(
                            credentials.password as string,
                            user.password
                        )
                    ) {
                        return user;
                    } else {
                        return null;
                    }
                },
            }),
        ],
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token.id = user.id;
                }
                return token;
            },
            async session({ session, token }) {
                if (token) {
                    session.user.id = token.id as string;
                }
                return session;
            },
        },
        session: {
            strategy: 'jwt',
        },
        adapter: DrizzleAdapter(drizzle(c.env.DB)),
    }))
);

app.post('/api/signup', async (c) => {
    const { name, email, password } = await c.req.json();
    const db = drizzle(c.env.DB);

    if (!email || !password) {
        return c.json({ error: 'Missing fields' }, 400);
    }

    const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .get();

    if (existingUser) {
        return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await db
        .insert(schema.users)
        .values({
            name,
            email,
            password: passwordHash,
        })
        .returning({ id: schema.users.id, email: schema.users.email })
        .get();

    return c.json({ id: newUser.id, username: newUser.email }, 201);
});

app.post('api/auth/create-passkey', async (c) => {
    try {
        const { email } = await c.req.json();
        const db = drizzle(c.env.DB);

        const user = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .get();

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        const challengePayload = await generateRegistrationOptions({
            rpID: 'localhost',
            rpName: 'InterIIT',
            userName: user.email || '',
            userID: new Uint8Array(),
        });

        user.passkeyChallenge = challengePayload.challenge;

        await db
            .update(schema.users)
            .set({ passkeyChallenge: challengePayload.challenge })
            .where(eq(schema.users.email, email));

        return c.json({ user: user, options: challengePayload });
    } catch (error) {
        console.error(
            'Error in /api/auth/create-passkey:',
            (error as Error).message
        );
        return c.json({ error: 'Internal server error' }, 500);
    }
});
app.post('api/auth/verify-creation', async (c) => {
    try {
        const db = drizzle(c.env.DB);
        const data = await c.req.json();

        const email = data.email;
        const cred = data.cred;
        const user = data.user;

        const challengeResult = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .get();

        const verificationResult = await verifyRegistrationResponse({
            expectedChallenge: challengeResult?.passkeyChallenge || '',
            expectedOrigin: 'http://localhost:3000',
            expectedRPID: 'localhost',
            response: cred,
        });

        if (!verificationResult.verified) {
            return c.json({ error: 'could not verify' });
        }

        const serializedKey = serializePasskey(
            verificationResult.registrationInfo
        );

        user.passkey = serializedKey;

        await db
            .update(schema.users)
            .set({ passkey: JSON.stringify(serializedKey) })
            .where(eq(schema.users.id, user.id));

        return c.json({ verified: true });
    } catch (error) {
        console.error(
            'Error in /api/auth/verify-creation:',
            (error as Error).message
        );
        return c.json({ error: 'Internal server error' }, 500);
    }
});

app.post('/api/auth/login-challenge', async (c) => {
    try {
        const options = await generateAuthenticationOptions({
            rpID: 'localhost',
        });

        return c.json({
            options,
        });
    } catch (err) {
        console.error(
            'Error in /api/auth/login-challenge:',
            (err as Error).message
        );
        return c.json({ error: 'Error in generating login challenge' }, 400);
    }
});

app.post('/api/auth/verify-key', async (c) => {
    try {
        const db = drizzle(c.env.DB);
        const { email, cred, challenge } = await c.req.json();
        const user = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .get();

        if (!user) {
            return c.json({ error: 'user not found' }, 404);
        }

        const passkey = deserializePasskey(JSON.parse(user.passkey!));

        const result = await verifyAuthenticationResponse({
            expectedChallenge: challenge,
            expectedOrigin: 'http://localhost:3000',
            expectedRPID: 'localhost',
            response: cred,
            authenticator: passkey,
        });

        if (!result.verified) {
            return c.json({ error: 'could not verify' });
        }

        return c.json({ success: true });
    } catch (error) {
        console.error(
            'Error in /api/auth/verify-key:',
            (error as Error).message
        );
        return c.json({ error: (error as Error).message }, 500);
    }
});

app.get('/', async (c) => {
    return c.redirect('http://localhost:3000');
});

app.use('/api/auth/*', authHandler());

app.use('/api/*', verifyAuth());

app.get('/api/protected', async (c) => {
    const auth = c.get('authUser');
    return c.json(auth);
});

app.post('/resetPassword', async (c) => {
    try {
        const { session, oldPass, newPass } = await c.req.json();
        const db = drizzle(c.env.DB);
        if (!session || !session.user) {
            return c.json({ error: 'Session or user not found' }, 404);
        }
        const authUser = session.user;
        const user = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, authUser.id!))
            .get();

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        if (!user.password || !bcrypt.compareSync(oldPass, user.password)) {
            return c.json({ error: 'Old password is incorrect' }, 400);
        }

        const passwordHash = await bcrypt.hash(newPass, 10);

        await db
            .update(schema.users)
            .set({ password: passwordHash })
            .where(eq(schema.users.id, authUser.id!));

        return c.json({ success: true });
    } catch (error) {
        console.log('Error_in_resetting', (error as Error).message);
        return c.json({ error: 'Error in resetting password' }, 500);
    }
});

// TODO: Add the companies API routes behind the auth middleware

app.get('/companies/raw-data/:id', async (c) => {
    const id = c.req.param('id');
    const company = data.find((company) => company.sl_no === parseInt(id));
    if (!company) {
        return c.json({ message: 'Company not found' }, 404);
    }
    return c.json(company);
});

app.get('/companies/gemini-analyze/:id', async (c) => {
    try {
        const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        analysis: {
                            type: SchemaType.OBJECT,
                            properties: {
                                growth: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        revenue: { type: SchemaType.STRING },
                                        expense: { type: SchemaType.STRING },
                                        market_share: {
                                            type: SchemaType.STRING,
                                        },
                                        overall: { type: SchemaType.STRING },
                                    },
                                },
                                stability: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        revenue: { type: SchemaType.STRING },
                                        expense: { type: SchemaType.STRING },
                                        market_share: {
                                            type: SchemaType.STRING,
                                        },
                                        overall: { type: SchemaType.STRING },
                                    },
                                },
                                key_insights: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        revenue_and_expense: {
                                            type: SchemaType.STRING,
                                        },
                                        market_share_fluctuations: {
                                            type: SchemaType.STRING,
                                        },
                                        diversity_score: {
                                            type: SchemaType.STRING,
                                        },
                                    },
                                },
                            },
                        },
                        predictions: {
                            type: SchemaType.OBJECT,
                            properties: {
                                stock_price: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        domestic: { type: SchemaType.NUMBER },
                                        global: { type: SchemaType.NUMBER },
                                    },
                                },
                                market_share: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        domestic: { type: SchemaType.NUMBER },
                                        global: { type: SchemaType.NUMBER },
                                    },
                                },
                                revenue: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        domestic: { type: SchemaType.NUMBER },
                                        global: { type: SchemaType.NUMBER },
                                    },
                                },
                                expense: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        domestic: { type: SchemaType.NUMBER },
                                        global: { type: SchemaType.NUMBER },
                                    },
                                },
                                overall: { type: SchemaType.STRING },
                            },
                        },
                        explanation_of_predictions: {
                            type: SchemaType.OBJECT,
                            properties: {
                                stock_price: { type: SchemaType.STRING },
                                market_share: { type: SchemaType.STRING },
                                revenue: { type: SchemaType.STRING },
                                expense: { type: SchemaType.STRING },
                            },
                        },
                    },
                },
            },
        });

        const id = c.req.param('id');
        const company = data.find((company) => company.sl_no === parseInt(id));

        if (!company) {
            return c.json({ message: 'Company not found' }, 404);
        }

        const prompt = `
    You are a financial advisor tasked with analyzing the following fictional company data:
    - Company Name: ${company.company}
    - Market Cap: ${JSON.stringify(company.market_cap)}
    - Revenue: ${JSON.stringify(company.revenue)}
    - Expenses: ${JSON.stringify(company.expense)}
    - Market Share: ${JSON.stringify(company.market_share)}
    - Stock Price: ${JSON.stringify(company.stock_price)}
    - Country: ${company.country}
    - Diversity Score: ${company.diversity}

    Comment on the growth, stability of the company inferring from the data.
    Predict the next year’s stock price, market share, revenue, expense than this
    company domestically and globally (compute all). 
    Note that in this prediction you should be thinking about how each factor is affected by the other factors
    Provide a detailed financial analysis based solely on the provided data, including key insights and recommendations for investment. 
    Some values are synthetic, generated using a machine learning model for predictive purposes (this information should NOT be included in the analysis). 

    Important notes:
    - Do NOT create or infer data beyond what's provided.
    - Do NOT request additional information.
    - Focus on actionable insights using only the given metrics.
`;

        const result = await model.generateContent([prompt]);

        console.log(result);

        return c.json({ result });
    } catch (error) {
        console.error('Error in /companies/gemini-analyze:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

app.get('/companies', async (c) => {
    return c.json(
        data.map((company) => ({
            sl_no: company.sl_no,
            company: company.company,
            country: company.country,
            country_code: company.country_code,
            diversity: company.diversity,
            market_cap: company.market_cap.value,
        }))
    );
});

app.get('/api/computations', async (c) => {
    const db = drizzle(c.env.DB);
    const authUser = c.get('authUser').user!;
    const computations = await db
        .select()
        .from(schema.computations)
        .where(eq(schema.computations.userId, authUser.id))
        .all();
    return c.json(computations);
});

app.post('/api/companies/analyze/:id', async (c) => {
    const id = c.req.param('id');
    const company = data.find((company) => company.sl_no === parseInt(id));
    if (!company) {
        return c.json({ message: 'Company not found' }, 404);
    }

    const db = drizzle(c.env.DB);
    const userId = c.get('authUser').user!.id;

    const submittedComputation = await db
        .insert(schema.computations)
        .values({
            userId,
            companyId: id,
            companyName: company.company,
            status: 'running',
            startTime: Date.now(),
        })
        .returning({ id: schema.computations.id });

    return c.json({
        message: 'Analysis started',
        id: submittedComputation[0].id,
    });
});

async function analyzeCompanyBackground(
    company: CompanyData,
    allCompanies: CompanyData[],
    computationId: string,
    c: Context
) {
    const startTime = Date.now();

    try {
        // Perform analysis
        const analysis = await analyzeCompany(company, allCompanies);

        const endTime = Date.now();
        const computationTime = endTime - startTime;

        // Ensure minimum 2 minutes response time
        const remainingTime = Math.max(0, 15000 - computationTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        const db = drizzle(c.env.DB);

        // Update the computation record
        await db
            .update(schema.computations)
            .set({
                status: 'completed',
                endTime: Date.now(),
                result: JSON.stringify({
                    analysis,
                    computationTime: computationTime / 1000, // in seconds
                    totalResponseTime: (Date.now() - startTime) / 1000, // in seconds
                }),
            })
            .where(eq(schema.computations.id, computationId));
    } catch (error) {
        console.error('Error in analyzeCompanyBackground:', error);

        const db = drizzle(c.env.DB);

        // Update the computation record with error status
        await db
            .update(schema.computations)
            .set({
                status: 'error',
                endTime: Date.now(),
                result: JSON.stringify({
                    error:
                        (error as Error).message || 'An unknown error occurred',
                    totalResponseTime: (Date.now() - startTime) / 1000, // in seconds
                }),
            })
            .where(eq(schema.computations.id, computationId));
    }
}

async function analyzeCompany(
    company: CompanyData,
    allCompanies: CompanyData[]
) {
    const domesticCompanies = allCompanies.filter(
        (c) => c.country_code === company.country_code
    );

    const analysis = {
        companiesInSameCountry: domesticCompanies.length,
        companiesWithGreaterDiversity: domesticCompanies.filter(
            (c) => c.diversity > company.diversity
        ).length,
        yearlyChanges: calculateYearlyChanges(company),
    };

    return analysis;
}

function calculateYearlyChangeInMetric(metric: YearlyData[]) {
    const yearlyChanges = [];
    for (let i = 1; i < metric.length; i++) {
        const current = metric[i].value;
        const previous = metric[i - 1].value;
        const change = ((current - previous) / previous) * 100;
        yearlyChanges.push(change);
    }
    return yearlyChanges;
}

function calculateYearlyChanges(company: CompanyData) {
    return {
        expense: calculateYearlyChangeInMetric(company.expense),
        revenue: calculateYearlyChangeInMetric(company.revenue),
        marketShare: calculateYearlyChangeInMetric(company.market_share),
    };
}

export default app;
