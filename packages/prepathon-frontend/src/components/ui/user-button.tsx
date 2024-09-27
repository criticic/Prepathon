import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signIn, signOut, useSession } from '@hono/auth-js/react'
import { LogInIcon } from 'lucide-react'

export default function UserButton() {
  const { data: session } = useSession()

  return (
    <>
      {!session ? (
        <div className='flex space-x-2 justify-evenly'>
          <Button onClick={() => signIn('github')}>
            <LogInIcon /> GitHub
          </Button>
          <Button onClick={() => signIn('google')}>
            <LogInIcon /> Google
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative w-8 h-8 rounded-full'>
              <Avatar className='w-8 h-8'>
                {session.user?.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name ?? ''}
                  />
                )}
                <AvatarFallback>{session?.user?.email}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {session.user?.name}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <Button
                variant='ghost'
                className='w-full p-0'
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
