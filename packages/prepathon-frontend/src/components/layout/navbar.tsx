import UserButton from '@/components/ui/user-button'
import CustomLink from '@/components/ui/custom-link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header className='sticky flex justify-center border-b'>
      <div className='flex items-center justify-between w-full h-16 max-w-3xl px-4 mx-auto sm:px-6'>
        <div className='flex items-center space-x-2 lg:space-x-6 gap-8'>
          <CustomLink href='/'>
            <Button variant='ghost' className='p-0'>
              <img src='/vite.svg' alt='Home' width='32' height='32' />
            </Button>
          </CustomLink>
          <CustomLink href='/api/protected'>Protected Api Route</CustomLink>
        </div>
        <UserButton />
      </div>
    </header>
  )
}
