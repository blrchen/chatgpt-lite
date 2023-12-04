'use client'

import { Avatar, DropdownMenu, IconButton } from '@radix-ui/themes'
import {SiOpenai} from "react-icons/si";

export const HeaderUser = () => {

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton radius="full">
          <Avatar
            fallback={ <SiOpenai className="h-4 w-4 " />}
            size="2"
            radius="full"
          />
        </IconButton>
      </DropdownMenu.Trigger>
    </DropdownMenu.Root>
  )
}

export default HeaderUser
