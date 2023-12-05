'use client'

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Flex, Heading, IconButton, ScrollArea, TextArea } from '@radix-ui/themes'
import { FiSend } from 'react-icons/fi'
import { AiOutlineClear, AiOutlineLoading3Quarters, AiOutlineUnorderedList } from 'react-icons/ai'
import clipboard from 'clipboard'
import { useToast } from '@/components'
import { ChatMessage, Chat } from './interface'
import ChatContext from './chatContext'
import Message from './Message'

import './index.scss'

export interface ChatProps {}

export interface ChatGPInstance {
  setConversation: (messages: ChatMessage[]) => void
  getConversation: () => ChatMessage[]
  focus: () => void
}

const postChatOrQuestion = async (chat: Chat, messages: any[], input: string) => {
  const url = chat.persona?.key ? '/api/document/question' : '/api/chat'

  const data = chat.persona?.key
    ? {
        key: chat.persona?.key,
        messages: [...messages!],
        question: input
      }
    : {
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
  const { toast } = useToast()
  const toastRef = useRef<any>(null)
  const { debug, currentChat, toggleSidebar, saveMessages, onToggleSidebar } =
    useContext(ChatContext)

  const [isLoading, setIsLoading] = useState(false)

  const conversationRef = useRef<ChatMessage[]>()

  const [conversation, setConversation] = useState<ChatMessage[]>([])

  const [message, setMessage] = useState('')

  const [currentMessage, setCurrentMessage] = useState<string>('')

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const bottomOfChatRef = useRef<HTMLDivElement>(null)

  const sendMessage = async (e: any) => {
    e.preventDefault()
    const input = textAreaRef.current?.value || ''

    if (input.length < 1) {
      toast({
        title: 'Error',
        description: 'Please enter a message.'
      })
      return
    }
    setMessage('')
    setIsLoading(true)
    setConversation?.([...conversation!, { content: input, role: 'user' }])

    try {
      const response = await postChatOrQuestion(currentChat!, conversation, input)

      if (response.ok) {
        const data = response.body

        if (!data) {
          throw new Error('No data')
        }

        const reader = data.getReader()
        const decoder = new TextDecoder('utf-8')
        let done = false
        let resultContent = ''

        while (!done) {
          try {
            const { value, done: readerDone } = await reader.read()
            const char = decoder.decode(value)
            if (char) {
              setCurrentMessage((state) => {
                if (debug) {
                  console.log({ char })
                }
                resultContent = state + char
                return resultContent
              })
            }
            done = readerDone
          } catch {
            done = true
          }
        }
        // The delay of timeout can not be 0 as it will cause the message to not be rendered in racing condition
        setTimeout(() => {
          if (debug) {
            console.log({ resultContent })
          }
          setConversation?.([
            ...conversation!,
            { content: input, role: 'user' },
            { content: resultContent, role: 'assistant' }
          ])
          setCurrentMessage('')
        }, 1)
      } else {
        const reuslt = await response.json()
        if (response.status === 401) {
          setConversation?.((state) => {
            state.pop()
            return [...state]
          })
          location.href =
            reuslt.redirect +
            `?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`
        } else {
          toast({
            title: 'Error',
            description: reuslt.error
          })
        }
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message
      })
      setIsLoading(false)
    }
  }

  const handleKeypress = (e: any) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      sendMessage(e)
      e.preventDefault()
    }
  }

  const clearMessages = () => {
    setConversation([])
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
    conversationRef.current = conversation
    if (currentChat?.id) {
      saveMessages?.(conversation)
    }
  }, [conversation, currentChat?.id, saveMessages])

  useEffect(() => {
    if (!isLoading) {
      textAreaRef.current?.focus()
    }
  }, [isLoading])

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[]) {
        setConversation(messages)
      },
      getConversation() {
        return conversationRef.current
      },
      focus: () => {
        textAreaRef.current?.focus()
      }
    }
  })

  useEffect(() => {
    new clipboard('.copy-btn').on('success', () => {})
  }, [])

  return (
    <Flex direction="column" height="100%" className="relative" gap="3">
      <Flex
        justify="between"
        align="center"
        py="3"
        px="4"
        style={{ backgroundColor: 'var(--gray-a2)' }}
      >
        <Heading size="4">{currentChat?.persona?.name || 'None'}</Heading>
      </Flex>
      <ScrollArea
        className="flex-1 px-4"
        type="auto"
        scrollbars="vertical"
        style={{ height: '100%' }}
      >
        {conversation?.map((item, index) => <Message key={index} message={item} />)}
        {currentMessage && <Message message={{ content: currentMessage, role: 'assistant' }} />}
        <div ref={bottomOfChatRef}></div>
      </ScrollArea>
      <div className="px-4 pb-3">
        <Flex align="end" justify="between" gap="3" className="relative">
          <TextArea
            ref={textAreaRef}
            data-id="root"
            variant="surface"
            placeholder="Send a message..."
            size="3"
            style={{
              minHeight: '24px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
            className="flex-1 rounded-3xl chat-textarea"
            tabIndex={0}
            value={message}
            disabled={isLoading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeypress}
          />
          <Flex gap="3" className="absolute right-0 pr-4 bottom-2 pt">
            {isLoading && (
              <Flex
                width="6"
                height="6"
                align="center"
                justify="center"
                style={{ color: 'var(--accent-11)' }}
              >
                <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
              </Flex>
            )}
            <IconButton
              variant="soft"
              disabled={isLoading}
              color="gray"
              size="2"
              className="rounded-xl"
              onClick={sendMessage}
            >
              <FiSend className="h-4 w-4" />
            </IconButton>
            <IconButton
              variant="soft"
              color="gray"
              size="2"
              className="rounded-xl"
              disabled={isLoading}
              onClick={clearMessages}
            >
              <AiOutlineClear className="h-4 w-4" />
            </IconButton>

            <IconButton
              variant="soft"
              color="gray"
              size="2"
              className="rounded-xl md:hidden"
              disabled={isLoading}
              onClick={onToggleSidebar}
            >
              <AiOutlineUnorderedList className="h-4 w-4" />
            </IconButton>
          </Flex>
        </Flex>
      </div>
    </Flex>
  )
}

export default forwardRef<ChatGPInstance, ChatProps>(Chat)
