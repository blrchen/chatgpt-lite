import { useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react'
import ClipboardJS from 'clipboard'
import { throttle } from 'lodash-es'
import { ChatConfig, ChatGPTProps, ChatMessage, ChatRole, Prompt } from './interface'

const scrollDown = throttle(
  () => {
    const messageList = document.querySelector('.message-list')
    setTimeout(() => {
      messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' })
    }, 0)
  },
  300,
  {
    leading: true,
    trailing: false
  }
)

const requestMessage = async (
  url: string,
  messages: ChatMessage[],
  prompts: ChatMessage[],
  controller: AbortController | null,
  config: ChatConfig
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      messages,
      prompts,
      config
    }),
    signal: controller?.signal
  })
  if (config.stream === false) {
    return response
  }

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = response.body

  if (!data) {
    throw new Error('No data')
  }

  return data.getReader()
}

export const useChatGPT = (props: ChatGPTProps, ref: any) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { prompts = [], config = {}, fetchPath, onMessages, onSettings, onChangeVersion } = props
  const [, forceUpdate] = useReducer((x) => !x, false)
  const allMessagesRef = useRef<ChatMessage[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [disabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const controller = useRef<AbortController | null>(null)
  const currentMessage = useRef<string>('')

  const archiveCurrentMessage = (message?: string) => {
    const content = message || currentMessage.current
    currentMessage.current = ''
    setLoading(false)
    if (content) {
      setMessages((messages) => {
        const newMessages = [
          ...messages,
          {
            content,
            role: ChatRole.Assistant
          }
        ]
        onMessages?.(newMessages)
        return newMessages
      })
      scrollDown()
    }
  }

  const fetchMessage = async (messages: ChatMessage[]) => {
    try {
      currentMessage.current = ''
      controller.current = new AbortController()
      setLoading(true)

      if (config.stream === false) {
        const data = (await requestMessage(
          fetchPath,
          messages,
          prompts,
          controller.current,
          config
        )) as Response
        const json = await data.json()
        archiveCurrentMessage(json.message)
      } else {
        const reader = (await requestMessage(
          fetchPath,
          messages,
          prompts,
          controller.current,
          config
        )) as ReadableStreamDefaultReader<Uint8Array>
        const decoder = new TextDecoder('utf-8')
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          if (value) {
            const char = decoder.decode(value)
            if (char === '\n' && currentMessage.current.endsWith('\n')) {
              continue
            }
            if (char) {
              currentMessage.current += char
              forceUpdate()
            }
            scrollDown()
          }
          done = readerDone
        }
        archiveCurrentMessage()
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      return
    }
  }

  const onStop = () => {
    if (controller.current) {
      controller.current.abort()
      archiveCurrentMessage()
    }
  }

  const onSend = (message: ChatMessage) => {
    const newMessages = [...messages, message]
    setMessages(newMessages)
    fetchMessage(newMessages)
    onMessages?.(newMessages)
    scrollDown()
  }

  const onClear = () => {
    setMessages([])
    onMessages?.([])
  }

  useEffect(() => {
    allMessagesRef.current = messages
  }, [messages])

  useEffect(() => {
    new ClipboardJS('.chat-wrapper .copy-btn')
  }, [])

  useImperativeHandle(
    ref,
    () => {
      return {
        setChatContent: (prompt: Prompt) => {
          inputRef.current!.value = prompt.content!
          inputRef.current!.style.height = 'auto'
        },
        setMessages: (messages: ChatMessage[]) => {
          setMessages(messages)
          scrollDown()
        },
        getMessages: () => {
          return allMessagesRef.current
        }
      }
    },
    []
  )

  return {
    loading,
    disabled,
    messages,
    currentMessage,
    inputRef,
    onChangeVersion,
    onSend,
    onClear,
    onStop,
    onSettings
  }
}
