import { Hono } from "hono"
import { authHandler,initAuthConfig,verifyAuth} from "@hono/auth-js"
import Google from "@auth/core/providers/google"
import { cors } from "hono/cors"
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1"
import GitHub from "@auth/core/providers/github";
import { GoogleGenerativeAI } from "@google/generative-ai"

interface Bindings {
  AUTH_GOOGLE_ID: string;
  AUTH_GOOGLE_SECRET: string;
  AUTH_GITHUB_ID: string;
  AUTH_GITHUB_SECRET: string;
  AUTH_SECRET: string;
  DB: D1Database;
  GEMINI_API: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type"],
    allowMethods: ["*"],
    maxAge: 86400,
    credentials: true,
  })
)

app.use("*", initAuthConfig( c => ({
  secret: c.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: c.env.AUTH_GOOGLE_ID,
      clientSecret: c.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: c.env.AUTH_GITHUB_ID,
      clientSecret: c.env.AUTH_GITHUB_SECRET
    })
  ],
  adapter: DrizzleAdapter(drizzle(c.env.DB))
})))

app.get("/", async (c) => {
  return c.redirect("http://localhost:3000")
})

app.use("/api/auth/*", authHandler())

app.use("/api/*", verifyAuth())

app.get("/api/protected", async (c)=> {
    const auth = c.get("authUser")
    return c.json(auth)
})

app.post("/chatbot", async (c) => {
  const userInput = await c.req.json().then((data) => data.userInput)

  if (!userInput) {
    return c.json({ error: "Invalid request body" }, 400)
  }

  try {
    const externalApiResponse = await fetch("/ml-model-api", {
      method: "GET",
    })
    const externalApiData = await externalApiResponse.json()

    const geminiResponse = await chat(userInput, c.env.GEMINI_API,externalApiData)

    return c.json({ response: geminiResponse })
  } catch (error) {
    console.error("Error in /api/chatbot:", error)
    return c.json({ error: "Failed to fetch data or call Gemini API" }, 500)
  }

})

async function chat(userInput: string, apiKey: string, externalData: any) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  }

  const safetySettings:any = [];

  const history = [
    {
      role: "user",
      parts: [{ text: userInput + "\nExternal Data: " + JSON.stringify(externalData) }],
    },
    {
      role: "model",
      parts: [{ text: "Processing your request..." }],
    },
  ]

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history,
  })

  const result = await chat.sendMessage(userInput)
  return result.response.text()
}

export default app