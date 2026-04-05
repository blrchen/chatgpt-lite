'use client'

import dynamic from 'next/dynamic'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import ThemeToggle from '@/components/theme/toggle'
import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Github } from 'lucide-react'

const ThemeOptionsDropdown = dynamic(() => import('@/components/theme/options-dropdown'))

export function Header(): React.JSX.Element {
  const { open, isMobile } = useSidebar()
  const showTrigger = !open || isMobile

  return (
    <header className="bg-background/95 border-border supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 w-full border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="flex items-center gap-2 py-2 pr-[max(env(safe-area-inset-right),0.5rem)] pl-[max(env(safe-area-inset-left),0.5rem)] sm:gap-3 sm:py-2.5 sm:pr-[max(env(safe-area-inset-right),0.75rem)] sm:pl-[max(env(safe-area-inset-left),0.75rem)]">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {showTrigger && (
            <SidebarTrigger className="hover:bg-primary/5 size-11 rounded-lg transition-colors duration-200" />
          )}
        </div>
        <div className="flex flex-1 justify-center">
          <ThemeOptionsDropdown />
        </div>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />
          <ButtonWithTooltip label="Open ChatGPT Lite on GitHub" placement="bottom">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/50 hover:text-foreground/70 rounded-full transition-colors duration-200 hover:bg-transparent"
              asChild
            >
              <a
                href="https://github.com/blrchen/chatgpt-lite"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open ChatGPT Lite on GitHub"
              >
                <Github aria-hidden="true" />
              </a>
            </Button>
          </ButtonWithTooltip>
        </nav>
      </div>
    </header>
  )
}
