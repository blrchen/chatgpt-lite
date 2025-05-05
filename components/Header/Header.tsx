'use client'

import { useCallback } from 'react'
import { Avatar, Flex, Heading, IconButton, Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import NextLink from 'next/link'
import { BsSun, BsMoonStars } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa6'
import { Link } from '../Link'
import { useTheme } from '../Themes'

export const Header = () => {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = useCallback(
    (nextTheme: 'dark' | 'light') => {
      if (theme === nextTheme) return
      setTheme(nextTheme)
    },
    [theme, setTheme]
  )

  return (
    <header
      className={clsx(
        'block shadow-sm sticky top-0 dark:shadow-gray-500 py-3 px-4 z-20 transition-colors duration-300'
      )}
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Flex align="center" gap="3">
        <NextLink href="/">
          <Heading as="h2" size="4" style={{ maxWidth: 200 }}>
            ChatGPT Lite
          </Heading>
        </NextLink>
        <Flex align="center" gap="3" className="ml-auto">
          <Tooltip
            content={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            delayDuration={100}
          >
            <IconButton
              size="3"
              variant="ghost"
              color="gray"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              radius="full"
              tabIndex={0}
              className="transition-all duration-300"
              style={{ outline: 'none' }}
            >
              {theme === 'dark' ? (
                <BsSun className="text-xl transition-transform duration-300 rotate-0 dark:rotate-180" />
              ) : (
                <BsMoonStars className="text-xl transition-transform duration-300 rotate-0 dark:rotate-180" />
              )}
            </IconButton>
          </Tooltip>
          <Avatar
            color="gray"
            size="2"
            radius="full"
            fallback={
              <Link href="https://github.com/blrchen/chatgpt-lite" aria-label="GitHub Repository">
                <FaGithub />
              </Link>
            }
          />
        </Flex>
      </Flex>
    </header>
  )
}
