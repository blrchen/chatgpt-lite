'use client'

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { Flex, Heading, IconButton, ScrollArea, Tooltip } from '@radix-ui/themes'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ContentEditable from 'react-contenteditable'
import toast from 'react-hot-toast'
import { AiOutlineClear, AiOutlineLoading3Quarters, AiOutlineUnorderedList } from 'react-icons/ai'
import { FiSend } from 'react-icons/fi'
import ChatContext from './chatContext'
import type { Chat, ChatMessage } from './interface'
import Message from './Message'
import WelcomeSection from './WelcomeSection';
import SwapBridgeStakeActionButtons from './SwapBridgeStakeActionButtons';

import './index.scss'

// 动画 keyframes 注入（仅一次）
if (typeof window !== 'undefined' && !document.getElementById('glowPulseKeyframes')) {
  const style = document.createElement('style');
  style.id = 'glowPulseKeyframes';
  style.innerHTML = `@keyframes glowPulse {
    0% { box-shadow: 0 0 16px 4px #00C6FB88, 0 2px 8px 0 rgba(0,0,0,0.12); }
    100% { box-shadow: 0 0 26px 8px #00C6FBcc, 0 2px 8px 0 rgba(0,0,0,0.14); }
  }`;
  document.head.appendChild(style);
}


const HTML_REGULAR =
  /<(?!img|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|td|\/td|th|\/th|br|\/br).*?>/gi

export interface ChatProps {
  chatId?: string;
}

export interface ChatGPInstance {
  setConversation: (messages: ChatMessage[]) => void
  getConversation: () => ChatMessage[]
  focus: () => void
}

const postChatOrQuestion = async (chat: Chat, messages: any[], input: string) => {
  const url = '/api/chat'

  const data = {
    prompt: chat?.persona?.prompt,
    messages: [...messages!],
    input
  }

  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}


const Chat = (props: ChatProps, ref: any) => {
  // 组件顶层获取 context，避免 hooks 错误
  const context = useContext(ChatContext);
  // debug, setIsLoading, setCurrentMessage 如未用到，前面加下划线防止 ESLint 警告
  const { debug: _debug, currentChatRef, saveMessages, onToggleSidebar, forceUpdate, onCreateChat, DefaultPersonas } = context;
  const router = useRouter();

  // 只保留一份 state/ref 声明
  const [isLoading, _setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentMessage, _setCurrentMessage] = useState<string>('');
  const conversation = useRef<ChatMessage[]>([]);
  const textAreaRef = useRef<HTMLElement>(null);
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  // --- 自动加载当前 chatId 的历史消息 ---
  useEffect(() => {
    const chatId = props.chatId || currentChatRef?.current?.id;
    if (chatId) {
      // const local = localStorage.getItem(`ms_${chatId}`);
      // let messages: ChatMessage[] = [];
      // if (local) {
      //   try { messages = JSON.parse(local) || []; } catch {}
      // }
      // conversation.current = messages;
      // forceUpdate?.();
    }
  }, [props.chatId, currentChatRef?.current?.id]);

  // Test proxy by requesting baidu.com and qq.com

  const sendMessage = useCallback(
    async () => {
      console.log('[sendMessage] called', { isLoading, message, currentChatId: currentChatRef?.current?.id });
      if (isLoading) return;
      const input = message.trim();
      if (!input) {
        toast.error('Please type a message to continue.');
        return;
      }
      _setIsLoading(true);
      try {
        let chatId = currentChatRef?.current?.id;
        let chat = currentChatRef?.current;

        console.log('[sendMessage] chatId click', chatId, chat, DefaultPersonas);
        console.log('[sendMessage] 当前 props.chatId:', props.chatId, 'currentChatRef.current?.id:', currentChatRef?.current?.id, 'chatId:', chatId);
        // 只要在 /chat 页面点击发送，就强制新建会话并跳转
        if (!props.chatId && onCreateChat && DefaultPersonas && DefaultPersonas[0]) {
          console.log('[sendMessage] 强制新建会话！');
          currentChatRef.current = undefined; // 重置当前会话
          chat = onCreateChat(DefaultPersonas[0], input);
          chatId = chat?.id;

          setMessage('');
          if (chatId && typeof window !== 'undefined' && router) {
            router.push(`/chat/${chatId}`);
            return;
          }
        } else if (chatId) {
          console.log('[sendMessage] 往已有会话追加消息:', chatId);
          // Existing chat: add user message, call API, add assistant reply
          conversation.current.push({ content: input, role: 'user' });
          saveMessages?.(conversation.current);
          setMessage('');
          forceUpdate?.();
          // POST to external API (like langgraph-defi-interface)
          const response = await axios.post('https://langgraph-defai.vercel.app/api/chat', {
            message: input,
            timestamp: new Date().toISOString()
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          const data = response.data;
          if (data && data.result) {
            conversation.current.push({ content: data.result, role: 'assistant' });
            saveMessages?.(conversation.current);
            forceUpdate?.();
          } else {
            toast.error(data?.error || 'No reply from AI');
          }
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Failed to send message');
      } finally {
        _setIsLoading(false);
      }
    },
    [isLoading, message, forceUpdate, currentChatRef, saveMessages, onCreateChat, DefaultPersonas, router]
  )

  const handleKeypress = useCallback(
    (e: any) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  )

  const clearMessages = () => {
    conversation.current = []
    forceUpdate?.()
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '50px'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 2}px`
    }
  }, [message, textAreaRef])

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, currentMessage])

  useEffect(() => {
    // conversationRef.current = conversation.current; // 已无 conversationRef
    if (currentChatRef?.current?.id) {
      saveMessages?.(conversation.current);
    }
    // 不要依赖 conversation.current，防止死循环
  }, [currentChatRef?.current?.id, saveMessages]);

  useEffect(() => {
    if (!isLoading) {
      textAreaRef.current?.focus()
    }
  }, [isLoading])

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[]) {
        conversation.current = messages
        forceUpdate?.()
      },
      getConversation() {
        return conversation.current // 修正：已无 conversationRef
      },
      focus: () => {
        textAreaRef.current?.focus()
      }
    }
  })

  // 自动发送事件监听（保留）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let pendingInput: string | null = null;
      const handler = (e: any) => {
        if (typeof e.detail === 'string') {
          setMessage(e.detail);
          pendingInput = e.detail;
        }
      };
      window.addEventListener('autoSendInput', handler);
      return () => window.removeEventListener('autoSendInput', handler);
    }
  }, []);

  // 监听 message 变化，自动发送
  useEffect(() => {
    if (message && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const inputParam = url.searchParams.get('input');
      if (inputParam && inputParam === message) {
        // 清除参数，避免重复发送
        url.searchParams.delete('input');
        window.history.replaceState({}, '', url.pathname + url.search);
        sendMessage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <Flex direction="column" height="100vh" className="relative" gap="3" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Flex
        justify="between"
        align="center"
        py="3"
        px="4"
      >
        {/* <Flex align="center" gap="3">
          <Heading size="4">{currentChatRef?.current?.persona?.name || 'None'}</Heading>
        </Flex> */}
        {/* <Flex gap="2">
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            onClick={onToggleSidebar}
          >
            <AiOutlineUnorderedList />
          </IconButton>
        </Flex> */}
      </Flex>
      <Flex className="flex-1 px-4" style={{}}>
        {/* 仅在没有消息时显示欢迎，否则渲染消息列表 */}
        <WelcomeSection />
        <div ref={bottomOfChatRef} />
      </Flex>
      <Flex className="chat-textarea w-full items-end gap-3 fixed bottom-0 inset-x-0 z-30" align="end" style={{
  borderRadius: '40px',
  display: 'flex',
  width: '70vw',
  maxWidth: 700,
  padding: '12px 18px',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: '22px',
  height: 'auto',
  boxSizing: 'border-box',
  maxWidth: '100vw',
  margin: '0 auto',
  position: 'relative',
  flexDirection: 'column',
}}>
  {/* 5 Action Buttons */}
  <div style={{ width: '100%', marginBottom: 12 }}>
      <SwapBridgeStakeActionButtons setMessage={setMessage} />
  </div>
  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
    {(!message || message === '<br>') && (
      <span style={{
        position: 'absolute',
        left: 20,
        top: 0,
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        color: '#fff',
        pointerEvents: 'none',
        fontSize: 16,
        userSelect: 'none',
        zIndex: 1,
        fontWeight: 400,
        lineHeight: '50px',
        width: 'calc(100% - 56px)',
      }}>
        ask Miraix anything...
      </span>
    )}
    <ContentEditable
      innerRef={textAreaRef}
      html={message}
      disabled={isLoading}
      onChange={e => setMessage(e.target.value.replace(HTML_REGULAR, ''))}
      onKeyDown={handleKeypress}
      className="rt-TextAreaInput flex-1"
      style={{ paddingRight: '56px', paddingLeft: 20, minHeight: 22, height: 50, lineHeight: '50px', fontSize: 16, background: 'transparent', zIndex: 2 }}
    />
    <IconButton
      size="3"
      variant="solid"
      color="accent"
      disabled={isLoading}
      onClick={sendMessage}
      style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%) scale(0.7)',
        zIndex: 2,
        background: 'linear-gradient(100deg, #00C6FB 0%, #3F51B5 100%)',
        borderRadius: '50%',
        boxShadow: '0 0 16px 4px #00C6FB88, 0 2px 8px 0 rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.25s, transform 0.18s',
        padding: '6px',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        animation: 'glowPulse 2s infinite alternate',
      } as React.CSSProperties}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow = '0 0 38px 10px #00C6FBcc, 0 2px 8px 0 rgba(0,0,0,0.14)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(0.85)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow = '0 0 16px 4px #00C6FB88, 0 2px 8px 0 rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(0.7)';
      }}
    >
      {isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <FiSend />}
    </IconButton>
  </div>
</Flex>
    </Flex>
  );
}

export default forwardRef<ChatGPInstance, ChatProps>(Chat)
