'use client'

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { IconButton, Spinner } from '@material-tailwind/react'
import { AiOutlineClear } from 'react-icons/ai'
import toast from 'react-hot-toast'
import ChatContext from '@/contexts/chatContext'

import Message from '../message'

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
  const { currentChat, saveMessages } = useContext(ChatContext)

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
      toast.error('Please enter a message.')
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
          const { value, done: readerDone } = await reader.read()
          const char = decoder.decode(value)
          if (char) {
            setCurrentMessage((state) => {
              // console.log({ char })
              resultContent = state + char
              return resultContent
            })
          }
          done = readerDone
        }
        // The delay of timeout can not be 0 as it will cause the message to not be rendered in racing condition
        setTimeout(() => {
          setConversation?.([
            ...conversation!,
            { content: input, role: 'user' },
            { content: resultContent, role: 'assistant' }
          ])
          setCurrentMessage('')
        }, 1)
      } else {
        const reuslt = await response.json()
        toast.error(reuslt.error)
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
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
      textAreaRef.current.style.height = '24px'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [message, textAreaRef])

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    console.log(currentMessage)
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

  return (
    <div className="flex relative max-w-full flex-1 flex-col h-full bg-gray-100">
      <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-blue-gray-900">
        {currentChat?.persona?.name}
      </div>
      <div className="flex-1 overflow-auto">
        {conversation?.map((item, index) => (
          <Message key={index} message={item} />
        ))}
        {currentMessage && <Message message={{ content: currentMessage, role: 'assistant' }} />}
        <div ref={bottomOfChatRef}></div>
      </div>
      <div className="w-full border-t bg-white p-2">
        <div className="flex flex-row items-center w-full p-2 border-t gap-2 px-4 py-2 border border-black/10 bg-white rounded-md">
          <textarea
            ref={textAreaRef}
            value={message}
            tabIndex={0}
            data-id="root"
            style={{
              height: '24px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
            disabled={isLoading}
            placeholder="Send a message..."
            className="m-0 w-full flex-1 resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0 outline-none"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeypress}
          ></textarea>
          {isLoading && <Spinner color="blue" />}
          <IconButton disabled={isLoading} color="blue-gray" size="sm" onClick={sendMessage}>
            <FiSend className="h-4 w-4" />
          </IconButton>
          <IconButton disabled={isLoading} color="blue-gray" size="sm" onClick={clearMessages}>
            <AiOutlineClear className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default forwardRef<ChatGPInstance, ChatProps>(Chat)
