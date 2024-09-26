import { drizzle } from 'drizzle-orm/d1'
import { Context } from 'hono'
import * as schema from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const getDB = (c: Context) => drizzle(c.env.DATABASE, { schema })

export const getUser = async (email: string, c: Context) => {
  const db = getDB(c)
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  })

  return user
}

export const getUserFromDb = async (
  email: string,
  password: string,
  c: Context
) => {
  const user = await getUser(email, c)

  if (!user) return null

  const pwMatch = await bcrypt.compare(password, user.password || '')

  return pwMatch ? user : null
}
