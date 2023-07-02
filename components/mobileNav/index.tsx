'use client'

import { useContext } from 'react'
import { IconButton, Navbar, Typography } from '@material-tailwind/react'
import { RxHamburgerMenu } from 'react-icons/rx'
import { BsPlusLg } from 'react-icons/bs'
import MobileSiderbar from '../mobileSiderbar'
import ChatContext from '@/contexts/chatContext'

export interface MobileNavProps {
  showMobileSiderbar?: boolean
  toggleComponentVisibility?: () => void
}

const MobileNav = (props: MobileNavProps) => {
  const { showMobileSiderbar, toggleComponentVisibility } = props
  const { currentChat, onOpenPersonaModal } = useContext(ChatContext)
  return (
    <>
      <Navbar className="fixed top-0 flex items-center justify-between inset-0 z-10 h-max max-w-full rounded-none py-2 px-4 lg:px-8 lg:py-4 text-gray-900 md:hidden">
        <IconButton
          variant="text"
          className="h-8 w-8 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={toggleComponentVisibility}
        >
          <RxHamburgerMenu className="h-6 w-6" />
        </IconButton>

        <Typography className="cursor-pointer py-1.5 font-medium">
          {currentChat?.persona?.name || ''}
        </Typography>

        <IconButton
          variant="text"
          className="h-8 w-8 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={onOpenPersonaModal}
        >
          <BsPlusLg className="h-6 w-6" />
        </IconButton>
      </Navbar>
      <MobileSiderbar
        open={showMobileSiderbar}
        toggleComponentVisibility={toggleComponentVisibility}
      />
    </>
  )
}

export default MobileNav
