'use client'

import React, { useContext } from 'react'
import { Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes'
import cs from 'classnames'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BiMessageDetail } from 'react-icons/bi'
import { FiPlus } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import { useTheme } from '../Themes'
import ChatContext from './chatContext'

import './index.scss'

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

  const { theme } = useTheme();
  console.log('theme in chatsidebar', theme);
  // Log the value of chatList
  console.log('chatList in ChatSideBar:', chatList);

  // If chatList is null or empty, assign mock data for display
  let displayChatList = chatList;
  if (!Array.isArray(chatList) || chatList.length === 0) {
    displayChatList = [
      {
        id: 'mock-1',
        title: 'Mock Chat 1',
        persona: { id: 'mock-persona-1', name: 'Mock Persona', role: 'system', prompt: 'Mock prompt' },
        messages: []
      },
      {
        id: 'mock-2',
        title: 'Mock Chat 2',
        persona: { id: 'mock-persona-2', name: 'Mock Persona 2', role: 'system', prompt: 'Mock prompt 2' },
        messages: []
      }
    ];
  }

  return (
    <Flex direction="column" className={cs('chat-side-bar', { show: toggleSidebar })} style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217', position: 'relative', minHeight: '100vh' }}>
      <Flex className="p-2 h-full overflow-hidden w-64" direction="column" gap="3" style={{ backgroundColor: theme === 'light' ? '#F8F9FB' : '#111217', flex: 1, minHeight: 0 }}>
        <ScrollArea className="flex-1 " style={{ width: '100%' }} type="auto">
          <Flex direction="column" gap="3">
            {displayChatList.map((chat) => (
              <Box
                key={chat.id}
                className={cs('chat-history-row', {
                  active: currentChatRef?.current?.id === chat.id,
                })}
                onClick={() => {
                  onChangeChat?.(chat);
                  if (typeof window !== 'undefined') {
                    window.location.href = `/chat/${chat.id}`;
                  }
                }}
              >
                <Flex gap="2" align="center" className="overflow-hidden whitespace-nowrap">
                  <img src="/solana-logo.svg" alt="" className="size-4" />
                  <Text as="p" className="truncate">{chat.title || chat.persona?.name}</Text>
                </Flex>
              </Box>
            ))}
          </Flex>
        </ScrollArea>
      </Flex>
      {/* Fixed beautiful Twitter links at the bottom */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        zIndex: 10
      }}>
        {/* Twitter Link */}
        <a
          href="https://x.com/askthehive_ai"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-social-link twitter-link"
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
            width: '80%',
            justifyContent: 'center',
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
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1.2em"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 8, flexShrink: 0 }}
          >
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
          </svg>
          <span className="truncate">Follow Twitter</span>
        </a>
        {/* Discord Link */}
        <a
          href="https://discord.gg/8TVcFvySWG"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-social-link discord-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
            padding: '8px 18px',
            background: theme === 'light'
              ? 'linear-gradient(90deg, #ecf2ff 0%, #e4e9f7 100%)'
              : 'linear-gradient(90deg, #23243a 0%, #5865f2 100%)',
            color: theme === 'light' ? '#5865f2' : '#fff',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: theme === 'light'
              ? '0 1px 8px 0 rgba(80,120,200,0.07)'
              : '0 1px 8px 0 rgba(30,40,80,0.17)',
            transition: 'all 0.18s',
            textDecoration: 'none',
            width: '80%',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
            border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #5865f2',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.background = theme === 'light'
              ? 'linear-gradient(90deg, #d1dcff 0%, #b3c7fa 100%)'
              : 'linear-gradient(90deg, #5865f2 0%, #23243a 100%)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.background = theme === 'light'
              ? 'linear-gradient(90deg, #ecf2ff 0%, #e4e9f7 100%)'
              : 'linear-gradient(90deg, #23243a 0%, #5865f2 100%)';
            (e.currentTarget as HTMLElement).style.color = theme === 'light' ? '#5865f2' : '#fff';
          }}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 640 512"
            height="1.2em"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 8, flexShrink: 0 }}
          >
            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
          </svg>
          <span className="truncate">Join Discord</span>
        </a>
      </div>
    </Flex>
  )
}

export default ChatSideBar
