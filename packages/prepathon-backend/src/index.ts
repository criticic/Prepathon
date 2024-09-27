import { Context, Hono } from 'hono'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import Google from '@auth/core/providers/google'
import { cors } from 'hono/cors'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { drizzle } from 'drizzle-orm/d1'
import GitHub from '@auth/core/providers/github'
import Credentials from '@auth/core/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUser, getUserFromDb } from './user'

interface Bindings {
  AUTH_GOOGLE_ID: string
  AUTH_GOOGLE_SECRET: string
  AUTH_GITHUB_ID: string
  AUTH_GITHUB_SECRET: string
  AUTH_SECRET: string
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin) => origin,
    allowHeaders: ['Content-Type'],
    allowMethods: ['*'],
    maxAge: 86400,
    credentials: true,
  })
)

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
      Credentials({
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        authorize: async (credentials) => {
          const pwHash = await bcrypt.hash(credentials.password as string, 10)
          const userExists = await getUser(credentials.email as string, c)

          if (!userExists) {
            return null
          }

          const user = await getUserFromDb(
            credentials.email as string,
            pwHash,
            c
          )

          if (user) {
            return user
          }

          return null
        },
      }),
    ],
    adapter: DrizzleAdapter(drizzle(c.env.DB)),
  }))
)

app.get('/', async (c) => {
  return c.redirect('http://localhost:3000')
})

app.use('/api/auth/*', authHandler())

app.use('/api/*', verifyAuth())

app.get('/api/protected', async (c) => {
  const auth = c.get('authUser')
  return c.json(auth)
})

export default app
