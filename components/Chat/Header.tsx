import React, { useState, useContext } from 'react'
import { CSSProperties } from 'react'
import { Box, Flex, IconButton, Text } from '@radix-ui/themes'
import cs from 'classnames'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiMessageDetail } from 'react-icons/bi'
import { FiPlus, FiCheckSquare } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import { useTheme } from '../Themes'
import ChatContext from './chatContext'
import SidePanel from './SidePanel'

import './index.scss'

export const Header = () => {
    const { theme } = useTheme()
    const { currentChatRef, chatList, DefaultPersonas, toggleSidebar, onDeleteChat, onChangeChat, onCreateChat, onOpenPersonaPanel } = useContext(ChatContext)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [isWalletPanelOpen, setIsWalletPanelOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const handleLogin = () => {
        setIsLoggedIn(true)
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
    }

    // Common button styles
    const buttonStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: 12,
        padding: '8px 18px',
        background: theme === 'light'
            ? 'linear-gradient(90deg, #f7fafc 0%, #e3f0ff 100%)'
            : 'linear-gradient(90deg, #23243a 0%, #23243a 100%)',
        color: theme === 'light' ? '#222' : '#e0e0e6',
        fontWeight: 600,
        fontSize: 14,
        boxShadow: theme === 'light'
            ? '0 1px 8px 0 rgba(80,120,200,0.07)'
            : '0 1px 8px 0 rgba(30,40,80,0.17)',
        transition: 'all 0.18s',
        textDecoration: 'none',
        cursor: 'pointer',
        backdropFilter: 'blur(2px)',
        border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #393a4c',
        position: 'relative' as const,
        overflow: 'hidden',
        marginBottom: '8px',
        width: '100%',
    }

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = theme === 'light'
            ? 'linear-gradient(90deg, #e3f0ff 0%, #b3e4fa 100%)'
            : 'linear-gradient(90deg, #23243a 0%, #393a4c 100%)'
        e.currentTarget.style.color = theme === 'light' ? '#1d72b8' : '#fff'
    }

    const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = theme === 'light'
            ? 'linear-gradient(90deg, #f7fafc 0%, #e3f0ff 100%)'
            : 'linear-gradient(90deg, #23243a 0%, #23243a 100%)'
        e.currentTarget.style.color = theme === 'light' ? '#222' : '#e0e0e6'
    }

    return (
        <Box className={cs('chat-header', { show: toggleSidebar })} style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217' }}>
            <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3" style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217', flex: 1, minHeight: 0 }}>
                <Flex direction="column" justify="between" className="p-2">
                    <Text size="4" weight="bold" className="text-gray-900 dark:text-gray-100 mb-4">
                        ChatGPT Lite
                    </Text>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="sidebar-social-link"
                            style={buttonStyle}
                            onMouseOver={handleButtonHover}
                            onMouseOut={handleButtonLeave}
                        >
                            <span>Open Panel</span>
                        </button>

                        {!isLoggedIn && (
                            <>
                                <button
                                    onClick={handleLogin}
                                    className="sidebar-social-link"
                                    style={buttonStyle}
                                    onMouseOver={handleButtonHover}
                                    onMouseOut={handleButtonLeave}
                                >
                                    <span>Log In</span>
                                </button>

                                <button
                                    className="sidebar-social-link"
                                    style={buttonStyle}
                                    onMouseOver={handleButtonHover}
                                    onMouseOut={handleButtonLeave}
                                >
                                    <span>Export EVM Embedded Wallet</span>
                                </button>

                                <button
                                    className="sidebar-social-link"
                                    style={buttonStyle}
                                    onMouseOver={handleButtonHover}
                                    onMouseOut={handleButtonLeave}
                                >
                                    <span>Export Solana Embedded Wallet</span>
                                </button>
                            </>
                        )}

                        {isLoggedIn && (
                            <button
                                onClick={() => setIsWalletPanelOpen(true)}
                                className="sidebar-social-link"
                                style={buttonStyle}
                                onMouseOver={handleButtonHover}
                                onMouseOut={handleButtonLeave}
                            >
                                <span className="flex items-center gap-2">
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                                    </svg>
                                    <span>Wallet</span>
                                </span>
                            </button>
                        )}
                    </div>
                </Flex>
            </Flex>

            <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Chat Settings</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Configure your chat preferences here.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Task Management</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            View and manage your tasks.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Strategy Settings</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Configure your AI strategies.
                        </p>
                    </div>
                </div>
            </SidePanel>

            <SidePanel isOpen={isWalletPanelOpen} onClose={() => setIsWalletPanelOpen(false)}>
                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-lg font-medium">Wallet Settings</h3>
                        <div className="space-y-4">
                            <button
                                onClick={handleLogout}
                                className="w-full text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
                            >
                                Logout
                            </button>
                            <button
                                className="w-full text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
                            >
                                Export EVM Embedded Wallet
                            </button>
                            <button
                                className="w-full text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
                            >
                                Export Solana Embedded Wallet
                            </button>
                        </div>
                    </div>
                </div>
            </SidePanel>
        </Box>
    )
}

export default Header 