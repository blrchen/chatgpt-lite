// @ts-nocheck
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Text } from '@radix-ui/themes'
import { BiMessageDetail } from 'react-icons/bi'
import { FiPlus } from 'react-icons/fi'

interface ChatSelectorProps {
  chatList: any[]
  currentChatId?: string
  onChangeChat: (chat: any) => void
  onCreateChat?: () => void
}

export const ChatSelector: React.FC<ChatSelectorProps> = ({
  chatList,
  currentChatId,
  onChangeChat,
  onCreateChat
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium bg-white dark:bg-[#1d1e29] text-black dark:text-white border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex items-center gap-2">
          <BiMessageDetail className="text-sm text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
          <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors font-medium tracking-wide hover:tracking-wider">ChatLists</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 hover:rotate-90"
            onClick={(e) => {
              e.stopPropagation()
              onCreateChat?.()
            }}
          >
            <FiPlus className="text-sm text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
          </button>
          <span className={`text-xs text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      <div
        className={`absolute z-50 w-full mt-1 bg-white dark:bg-[#1d1e29] rounded-lg shadow-lg border border-blue-200 dark:border-blue-800 transition-all duration-200 ease-in-out transform origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="py-1 max-h-60 overflow-y-auto">
          {chatList.map((chat) => (
            <button
              key={chat.id}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-all duration-150 ease-in-out ${chat.id === currentChatId
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-300'
                }`}
              onClick={() => {
                onChangeChat(chat)
                setIsOpen(false)
              }}
            >
              <BiMessageDetail className={`text-sm ${chat.id === currentChatId ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <Text className="truncate font-medium tracking-wide hover:tracking-wider">{chat.title || chat.persona?.name}</Text>
              {chat.id === currentChatId && (
                <span className="ml-auto text-blue-500 dark:text-blue-400 text-sm animate-pulse">•</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatSelector
