'use client'

import * as React from 'react'
import { useContext } from 'react'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa6'
import { HiOutlineMenu } from 'react-icons/hi'
import ChatContext from '@/components/chat/chatContext'
import ThemeToggle from '@/components/theme/toggle'
import { Button } from '@/components/ui/button'

export const Header = () => {
  const context = useContext(ChatContext)
  const { onToggleSidebar } = context || {}
  return (
    <header className="sticky top-0 z-20 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onToggleSidebar?.()
            }}
            className="transition-colors"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <HiOutlineMenu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center cursor-pointer select-none">
            <h2 className="text-lg font-semibold text-foreground max-w-[120px] sm:max-w-[200px] truncate">
              ChatGPT Lite
            </h2>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <a
              href="https://github.com/blrchen/chatgpt-lite"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 transition-colors hover:bg-accent text-foreground"
            >
              <FaGithub className="text-xl" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
