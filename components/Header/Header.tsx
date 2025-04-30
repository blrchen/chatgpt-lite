'use client'

import { useCallback, useState } from 'react'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Avatar, Flex, Heading, IconButton, Select, Tooltip } from '@radix-ui/themes'
import cs from 'classnames'
import NextLink from 'next/link'
import { FaAdjust, FaGithub, FaMoon, FaRegSun } from 'react-icons/fa'
import { Link } from '../Link'
import { useTheme } from '../Themes'
import { ConnectButton } from './ConnectButton'

export const Header = () => {
  const { theme, setTheme } = useTheme()
  console.log('theme', theme)
  const [, setShow] = useState(false)

  const toggleNavBar = useCallback(() => {
    setShow((state) => !state)
  }, [])

  return (
    <header
      className={cs('block shadow-sm sticky top-0 dark:shadow-gray-500 py-3 px-4 z-20 border-b')}
      style={{ 
        backgroundColor: theme === 'light' ? '#F8F9FB' : '#18181c',
        borderBottom: theme === 'light' ? '1px solid #E5E7EB' : '1px solid #23243a'
      }}
    >
      <Flex align="center" gap="3">
        <NextLink href="/">
          <Heading
            as="h2"
            size="4"
            style={{
              maxWidth: 200,
              fontWeight: 900,
              letterSpacing: '0.08em',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
              background: theme === 'dark'
                ? 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eac9 100%)'
                : 'linear-gradient(90deg, #4f8cff 0%, #7fdbda 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: theme === 'dark'
                ? '0 2px 12px rgba(64,64,128,0.18)'
                : '0 2px 8px rgba(100,200,255,0.13)',
              fontSize: 32
            }}
          >
            MiraiX
          </Heading>
        </NextLink>
        <Flex align="center" gap="3" className="ml-auto" style={{  }}>
          {/* <Select.Root value={theme} onValueChange={setTheme} className="hidden">
            <Select.Trigger radius="full" >
              {theme === 'light' ? <FaMoon color="#e0e0e6" /> : <FaRegSun color="#e0e0e6" />}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="light">
                <FaRegSun color="#e0e0e6" />
              </Select.Item>
              <Select.Item value="dark">
                <FaMoon color="#e0e0e6" />
              </Select.Item>
            </Select.Content>
          </Select.Root> */}
          <ConnectButton />
        </Flex>
        <Tooltip content="Navigation" style={{  }}>
          <IconButton
            size="3"
            variant="ghost"
            color="gray"
            className="md:hidden"
            onClick={toggleNavBar}
          >
            <HamburgerMenuIcon width="16" height="16" />
          </IconButton>
        </Tooltip>
      </Flex>
    </header>
  )
}
