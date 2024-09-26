import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import UserButton from '@/components/ui/user-button'
import { Session } from '@auth/core/types'
import { signIn, useSession } from '@hono/auth-js/react'
import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'

function SessionData({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
      <div className='w-full space-y-2 overflow-auto'>
        <h2 className='text-xl font-bold'>Current Session Data</h2>
        {Object.keys(session.user).length > 3 ? (
          <p>
            In this example, the whole session object is passed to the page,
            including the raw user object. Our recommendation is to{' '}
            <em>only pass the necessary fields</em> to the page, as the raw user
            object may contain sensitive information.
          </p>
        ) : (
          <p>
            In this example, only some fields in the user object is passed to
            the page to avoid exposing sensitive information.
          </p>
        )}
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    )
  }
}

const UpdateForm = () => {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')

  if (!session?.user) return null
  return (
    <>
      <h2 className='text-xl font-bold'>Updating the session</h2>
      <form
        onSubmit={async () => {
          if (session) {
            const newSession = await update({
              ...session,
              user: { ...session.user, name },
            })
            console.log({ newSession })
          }
        }}
        className='flex items-center w-full max-w-sm space-x-2'
      >
        <Input
          type='text'
          placeholder={session.user.name ?? ''}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />
        <Button type='submit'>Update</Button>
      </form>
    </>
  )
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    signIn('credentials', { email: 'asdf@dsfa.com', password: 'asdf' })
  }

  const { data: session, status } = useSession()
  return (
    <>
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-lg'>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription className=''>
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col'>
              <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-y-2'>
                  <Label>Email</Label>
                  <Input
                    id='email'
                    required
                    name='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete='email'
                  />
                  <Label>Password</Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete='current-password'
                  />
                </div>
                <Button type='submit' className='mt-4 w-full'>
                  Sign in with Email
                </Button>
              </form>
              <div className='relative mt-4'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>
                    Or continue with
                  </span>
                </div>
              </div>
              <div className='my-3'>
                <UserButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {status === 'loading' ? (
        <div>Loading...</div>
      ) : (
        <SessionData session={session} />
      )}
      <UpdateForm />
    </>
  )
}

export default Login
