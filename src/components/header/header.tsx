'use client'

import Link from 'next/link'
import ThemeOptionsDropdown from '@/components/theme/options-dropdown'
import ThemeToggle from '@/components/theme/toggle'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/contexts/app'
import { Github, Menu } from 'lucide-react'

export const Header = () => {
  const { onToggleSidebar } = useAppContext()
  return (
    <header className="bg-background border-border sticky top-0 z-20 w-full border-b">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="transition-colors"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="size-5" />
          </Button>
          <Link href="/" className="hidden cursor-pointer items-center select-none sm:flex">
            <h2 className="text-foreground max-w-[200px] truncate text-lg font-semibold">
              ChatGPT Lite
            </h2>
          </Link>
        </div>
        <div className="flex flex-1 justify-center">
          <ThemeOptionsDropdown />
        </div>
        <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/blrchen/chatgpt-lite"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:bg-accent hover:text-accent-foreground rounded-full p-2 transition-colors"
            aria-label="Open ChatGPT Lite on GitHub"
            title="Open ChatGPT Lite on GitHub"
          >
            <Github className="size-5" />
          </a>
        </nav>
      </div>
    </header>
  )
}
