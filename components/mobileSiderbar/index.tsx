'use client'

import React from 'react'
import Sidebar from '../sidebar'
import { Drawer } from '@material-tailwind/react'

export interface MobileSiderbarProps {
  open?: boolean
  toggleComponentVisibility?: boolean
}

const MobileSiderbar = (props: any) => {
  const { open, toggleComponentVisibility } = props

  return (
    <Drawer
      className="md:hidden"
      overlayProps={{ className: 'md:hidden' }}
      open={open}
      size={260}
      onClose={toggleComponentVisibility}
    >
      <Sidebar />
    </Drawer>
  )
}

export default MobileSiderbar
