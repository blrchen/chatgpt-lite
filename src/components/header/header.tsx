'use client'

import ThemeOptionsDropdown from '@/components/theme/options-dropdown'
import ThemeToggle from '@/components/theme/toggle'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/contexts/app'
import { Github, PanelLeft } from 'lucide-react'

export function Header(): React.JSX.Element {
  const { toggleSidebar, onToggleSidebar } = useAppContext()
  return (
    <header className="bg-background/95 border-border supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 w-full border-b pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Show open button only when sidebar is closed */}
          {!toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hover:bg-primary/5 size-11 rounded-lg transition-colors duration-200 md:size-9"
              title="Open Sidebar"
              aria-label="Open Sidebar"
            >
              <PanelLeft className="size-5" />
            </Button>
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <ThemeOptionsDropdown />
        </div>
        <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/5 size-11 rounded-full transition-colors duration-200 md:size-9"
            asChild
          >
            <a
              href="https://github.com/blrchen/chatgpt-lite"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ChatGPT Lite on GitHub"
              title="Open ChatGPT Lite on GitHub"
            >
              <Github className="size-5" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  )
}
