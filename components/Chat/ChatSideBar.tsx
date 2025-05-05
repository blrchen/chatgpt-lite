// @ts-nocheck
'use client'

import React, { useContext, useState } from 'react'
import { Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import cs from 'classnames'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiMessageDetail } from 'react-icons/bi'
import { FiPlus, FiCheckSquare } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import { useTheme } from '../Themes'
import ChatContext from './chatContext'
import './index.scss'
import { ChatSelector } from './ChatSelector'
import SidePanel from './SidePanel'
import { StrategiesSelector } from './StrategiesSelector'
import { TasksSelector } from './TasksSelector'

export const ChatSideBar = () => {
  const {
    currentChatRef,
    chatList,
    DefaultPersonas,
    toggleSidebar,
    onDeleteChat,
    onChangeChat,
    onCreateChat,
    onOpenPersonaPanel
  } = useContext(ChatContext)

  const { theme } = useTheme()
  console.log('theme in chatsidebar', theme)
  // Log the value of chatList
  console.log('chatList in ChatSideBar:', chatList)

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Add login state

  // If chatList is null or empty, assign mock data for display
  let displayChatList = chatList
  if (!Array.isArray(chatList) || chatList.length === 0) {
    displayChatList = [
      {
        id: 'mock-1',
        name: 'Mock Chat 1',
        persona: { id: 'mock-persona-1', name: 'Mock Persona', role: 'system', prompt: 'Mock prompt' },
        messages: []
      },
      {
        id: 'mock-2',
        name: 'Mock Chat 2',
        persona: { id: 'mock-persona-2', name: 'Mock Persona 2', role: 'system', prompt: 'Mock prompt 2' },
        messages: []
      }
    ]
  }

  // Mock data for tasks and strategies
  const mockTasks = [
    { id: 'task-1', title: 'Task 1' },
    { id: 'task-2', title: 'Task 2' }
  ]

  const mockStrategies = [
    { id: 'strategy-1', title: 'Strategy 1' },
    { id: 'strategy-2', title: 'Strategy 2' }
  ]

  // Create handlers
  const handleCreateChat = () => {
    if (onCreateChat) {
      onCreateChat()
    }
  }

  const handleCreateTask = () => {
    // TODO: Implement task creation logic
    console.log('Creating new task')
  }

  const handleCreateStrategy = () => {
    // TODO: Implement strategy creation logic
    console.log('Creating new strategy')
  }

  const handleLogin = () => {
    // Mock login function
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // Mock logout function
    setIsLoggedIn(false)
  }

  return (
    <Flex direction="column" className={cs('chat-side-bar', { show: toggleSidebar })} style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217', position: 'relative', minHeight: '100vh', paddingTop: '76px' }}>
      <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3" style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217', flex: 1, minHeight: 0 }}>
        <ScrollArea className="flex-1" style={{ width: '100%' }} type="auto">
          <Flex direction="column" gap="3">
            <ChatSelector
              chatList={displayChatList}
              currentChatId={currentChatRef?.current?.id}
              onChangeChat={onChangeChat}
              onCreateChat={handleCreateChat}
            />
            <TasksSelector
              taskList={mockTasks}
              currentTaskId={mockTasks[0].id}
              onChangeTask={(task) => console.log('Task selected:', task)}
              onCreateTask={handleCreateTask}
            />
            <StrategiesSelector
              strategyList={mockStrategies}
              currentStrategyId={mockStrategies[0].id}
              onChangeStrategy={(strategy) => console.log('Strategy selected:', strategy)}
              onCreateStrategy={handleCreateStrategy}
            />
          </Flex>
        </ScrollArea>

        {/* Social Links */}
        <div className="flex flex-col gap-2 mt-auto pt-4">
          <a
            href="https://discord.gg/your-discord"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = theme === 'light'
                ? 'linear-gradient(90deg, #e3f0ff 0%, #b3e4fa 100%)'
                : 'linear-gradient(90deg, #23243a 0%, #393a4c 100%)';
              (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#1d72b8' : '#fff';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = theme === 'light'
                ? 'linear-gradient(90deg, #f7fafc 0%, #e3f0ff 100%)'
                : 'linear-gradient(90deg, #23243a 0%, #23243a 100%)';
              (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#222' : '#e0e0e6';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Discord</span>
          </a>
          <a
            href="https://twitter.com/your-twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = theme === 'light'
                ? 'linear-gradient(90deg, #e3f0ff 0%, #b3e4fa 100%)'
                : 'linear-gradient(90deg, #23243a 0%, #393a4c 100%)';
              (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#1d72b8' : '#fff';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = theme === 'light'
                ? 'linear-gradient(90deg, #f7fafc 0%, #e3f0ff 100%)'
                : 'linear-gradient(90deg, #23243a 0%, #23243a 100%)';
              (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#222' : '#e0e0e6';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Twitter</span>
          </a>
        </div>
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
    </Flex>
  )
}

export default ChatSideBar
