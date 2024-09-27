// import ClientExample from './client-example'
import { SessionProvider } from '@hono/auth-js/react'

import Navbar from '@/components/layout/navbar'
import Login from './pages/Login'

export default function App() {
  return (
    <SessionProvider>
      <div className='min-h-screen'>
        <Navbar />
        <main className='container mx-auto'>
          {/* <ClientExample /> */}
          <Login />
        </main>
      </div>
    </SessionProvider>
  )
}
