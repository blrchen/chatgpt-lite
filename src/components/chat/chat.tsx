/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { ensureMessageIds, generateMessageId } from '@/components/chat/utils'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  ArrowUp,
  Eraser,
  FileText,
  ImagePlus,
  Loader2,
  Mic,
  MicOff,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { StickToBottom } from 'use-stick-to-bottom'

import ChatContext from './chatContext'
import type { ChatMessage, MessageContent } from './interface'
import { Message } from './message'
import { usePersonaContext } from './personaContext'

export interface ChatRef {
  setConversation: (messages: ChatMessage[], chatId?: string | null) => void
  getConversation: () => ChatMessage[]
  focus: () => void
}

const toMessagePayload = (messages: ChatMessage[]) =>
  messages.map(({ role, content }) => ({ role, content }))

const sendChatMessage = async (
  personaPrompt: string,
  messages: ChatMessage[],
  input: MessageContent
) => {
  const url = '/api/chat'

  const data = {
    prompt: personaPrompt,
    messages: toMessagePayload(messages),
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

type ConversationUpdater = ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])

const Chat = (_: object, ref: React.ForwardedRef<ChatRef>) => {
  const {
    currentChat,
    currentChatId,
    saveMessages,
    isChatHydrated,
    getChatById,
    onCreateDefaultChat
  } = useContext(ChatContext)
  const { getPersonaById } = usePersonaContext()

  const [loadingChatId, setLoadingChatId] = useState<string | null>(null)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  const [message, setMessage] = useState('')
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; mimeType: string }>>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{
      name: string
      content: string
      mimeType: string
      images?: Array<{ pageNumber: number; name: string; width: number; height: number; dataUrl: string }>
    }>
  >([])

  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isListening, setIsListening] = useState(false)

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const documentInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const getComposerValue = useCallback(() => textAreaRef.current?.value ?? message ?? '', [message])
  const getComposerText = useCallback(() => getComposerValue().trim(), [getComposerValue])

  const [conversation, setConversationState] = useState<ChatMessage[]>([])
  const conversationRef = useRef<ChatMessage[]>([])
  const conversationChatIdRef = useRef<string | undefined>(undefined)
  const activeChatIdRef = useRef<string | null>(null)
  const streamingChatIdRef = useRef<string | null>(null)
  const setConversation = useCallback(
    (updater: ConversationUpdater, chatId?: string | null) => {
      setConversationState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: ChatMessage[]) => ChatMessage[])(prev)
            : updater
        const nextWithIds = ensureMessageIds(next)
        conversationRef.current = nextWithIds
        const resolvedChatId =
          chatId === null ? undefined : (chatId ?? currentChatId ?? conversationChatIdRef.current)
        conversationChatIdRef.current = resolvedChatId
        return nextWithIds
      })
    },
    [currentChatId]
  )

  const chatInputId = useId()
  const helperTextId = useId()
  const errorTextId = useId()
  const isCurrentChatLoading = loadingChatId !== null && loadingChatId === currentChatId
  const hasActiveChat = Boolean(currentChatId ?? conversationChatIdRef.current)
  const canSend =
    isChatHydrated &&
    hasActiveChat &&
    !isCurrentChatLoading &&
    (Boolean(getComposerText()) || uploadedImages.length > 0 || uploadedDocuments.length > 0)
  const textareaClassName =
    'text-foreground w-full min-w-0 resize-none !border-0 !bg-transparent text-base leading-relaxed break-all !outline-none !shadow-none focus:!outline-none focus:!border-0 focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 max-h-[200px] min-h-[24px] overflow-y-auto [field-sizing:content]'

  const ensureActiveChat = useCallback(() => {
    const targetId = conversationChatIdRef.current ?? currentChatId ?? null
    const chat = getChatById(targetId)
    if (chat) {
      conversationChatIdRef.current = chat.id
      return chat
    }
    const created = onCreateDefaultChat?.()
    if (created) {
      conversationChatIdRef.current = created.id
    }
    return created ?? undefined
  }, [currentChatId, getChatById, onCreateDefaultChat])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setUploadedImages((prev) => [...prev, { url: base64, mimeType: file.type }])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleDocumentUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const fileType = file.type.toLowerCase()
      const fileName = file.name.toLowerCase()

      // Check if it's a supported document type
      const isSupported =
        fileType === 'text/plain' ||
        fileType === 'text/csv' ||
        fileType === 'application/pdf' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel' ||
        fileName.endsWith('.txt') ||
        fileName.endsWith('.csv') ||
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls')

      if (!isSupported) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }

      try {
        // Dynamically import the file parser
        const { parseFile } = await import('@/lib/fileParser')
        const parsed = await parseFile(file)

        setUploadedDocuments((prev) => [...prev, parsed])
        toast.success(`File "${file.name}" uploaded successfully`)
      } catch (error) {
        console.error('Error parsing file:', error)
        toast.error(`Failed to parse file: ${file.name}`)
      }
    }

    if (documentInputRef.current) {
      documentInputRef.current.value = ''
    }
  }, [])

  const removeDocument = useCallback((index: number) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'zh-CN' // Set to Chinese, you can make this configurable

        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setMessage((prev) => prev + finalTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow microphone access in your browser.')
          } else if (event.error === 'no-speech') {
            toast.error('No speech detected. Please try again.')
          } else {
            toast.error('Speech recognition error: ' + event.error)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Listening... Speak now')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Failed to start speech recognition')
      }
    }
  }, [isListening])

  useEffect(() => {
    activeChatIdRef.current = currentChatId ?? null
  }, [currentChatId])

  const sendMessage = useCallback(
    async (e: React.FormEvent | React.MouseEvent) => {
      if (loadingChatId !== null && loadingChatId === currentChatId) {
        return
      }

      e.preventDefault()
      const input = getComposerText()
      if (input.length < 1 && uploadedImages.length === 0 && uploadedDocuments.length === 0) {
        setComposerError('Please enter a message or upload a file to continue.')
        return
      }

      if (!isChatHydrated) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return
      }

      const activeChat = ensureActiveChat()
      if (!activeChat) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return
      }

      const targetChatId = activeChat.id
      activeChatIdRef.current = targetChatId
      const history = [...conversationRef.current]
      const personaForChat =
        activeChat.persona?.id && getPersonaById
          ? (getPersonaById(activeChat.persona.id) ?? activeChat.persona)
          : activeChat.persona
      const personaPrompt = personaForChat?.prompt?.trim() ?? ''
      if (!personaPrompt) {
        setComposerError('This persona is missing a prompt. Please edit it and try again.')
        return
      }
      // Build message content with text, images, and documents
      let messageContent: MessageContent = input
      if (uploadedImages.length > 0 || uploadedDocuments.length > 0) {
        const contentParts: Array<
          | { type: 'text'; text: string }
          | { type: 'image'; image: string; mimeType?: string }
          | {
              type: 'document'
              name: string
              content: string
              mimeType: string
              images?: Array<{
                pageNumber: number
                name: string
                width: number
                height: number
                dataUrl: string
              }>
            }
        > = []
        if (input) {
          contentParts.push({ type: 'text', text: input })
        }
        uploadedImages.forEach((img) => {
          contentParts.push({ type: 'image', image: img.url, mimeType: img.mimeType })
        })
        uploadedDocuments.forEach((doc) => {
          contentParts.push({
            type: 'document',
            name: doc.name,
            content: doc.content,
            mimeType: doc.mimeType,
            images: doc.images // Include PDF images
          })
        })
        messageContent = contentParts
      }

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        createdAt: new Date().toISOString(),
        content: messageContent,
        role: 'user'
      }
      const pendingConversation = [...history, userMessage]

      setLoadingChatId(targetChatId)
      setComposerError(null)
      setConversation(pendingConversation, targetChatId)
      saveMessages(pendingConversation, targetChatId, { chat: activeChat })
      setMessage('')
      setUploadedImages([])
      setUploadedDocuments([])
      setCurrentMessage('')

      streamingChatIdRef.current = targetChatId

      try {
        const response = await sendChatMessage(personaPrompt, history, messageContent)

        if (response.ok) {
          const data = response.body

          if (!data) {
            throw new Error('No data')
          }

          const reader = data.getReader()
          const decoder = new TextDecoder('utf-8')
          let done = false
          let resultContent = ''
          let frameHandle: number | null = null
          let chunkBuffer = ''

          const flushBuffer = () => {
            if (!chunkBuffer) return
            resultContent += chunkBuffer
            chunkBuffer = ''
            const isCurrentChatActive =
              streamingChatIdRef.current === targetChatId &&
              activeChatIdRef.current === targetChatId
            if (isCurrentChatActive) {
              setCurrentMessage(resultContent)
            }
          }

          while (!done) {
            try {
              const { value, done: readerDone } = await reader.read()
              const char = decoder.decode(value, { stream: true })
              if (char) {
                chunkBuffer += char
                if (frameHandle === null) {
                  frameHandle = requestAnimationFrame(() => {
                    flushBuffer()
                    frameHandle = null
                  })
                }
              }
              done = readerDone
            } catch {
              done = true
            }
          }

          if (frameHandle !== null) {
            cancelAnimationFrame(frameHandle)
            frameHandle = null
          }
          flushBuffer()

          const finalAssistantMessage: ChatMessage = {
            id: generateMessageId(),
            createdAt: new Date().toISOString(),
            content: resultContent,
            role: 'assistant'
          }
          const finalConversation: ChatMessage[] = [...pendingConversation, finalAssistantMessage]

          if (activeChatIdRef.current === targetChatId) {
            setConversation(finalConversation, targetChatId)
          }
          saveMessages(finalConversation, targetChatId, { chat: activeChat })
          if (
            streamingChatIdRef.current === targetChatId &&
            activeChatIdRef.current === targetChatId
          ) {
            setCurrentMessage('')
          }
        } else {
          const result = await response.json()
          toast.error(result.error)
          setComposerError('Unable to send message. Please try again.')
        }
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Unknown error')
        setComposerError('Something went wrong. Please try again.')
      } finally {
        if (streamingChatIdRef.current === targetChatId) {
          streamingChatIdRef.current = null
        }
        setLoadingChatId((prev) => (prev === targetChatId ? null : prev))
      }
    },
    [
      isChatHydrated,
      ensureActiveChat,
      getPersonaById,
      getComposerText,
      currentChatId,
      loadingChatId,
      saveMessages,
      setConversation,
      uploadedImages,
      uploadedDocuments
    ]
  )

  const handleKeypress = useCallback(
    (e: React.KeyboardEvent) => {
      // Block submission during IME composition (e.g., Chinese/Japanese/Korean input)
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault()
        if (!isChatHydrated || isCurrentChatLoading) {
          return
        }
        const input = getComposerText()
        if (!input) {
          setComposerError('Please enter a message to continue.')
          return
        }
        sendMessage(e)
      }
    },
    [getComposerText, isChatHydrated, isComposing, isCurrentChatLoading, sendMessage]
  )

  const clearMessages = () => {
    const chatId = currentChatId ?? null
    if (isCurrentChatLoading) {
      return
    }
    setConversation([], chatId)
    setUploadedImages([])
    setUploadedDocuments([])
  }

  useEffect(() => {
    if (currentChatId) {
      conversationChatIdRef.current = currentChatId
    }
  }, [currentChatId])

  useEffect(() => {
    if (!currentChat?.id) {
      setCurrentMessage('')
      return
    }
    if (streamingChatIdRef.current && streamingChatIdRef.current !== currentChat.id) {
      setCurrentMessage('')
    }
  }, [currentChat?.id])

  useEffect(() => {
    if (!currentChatId) {
      return
    }
    if (!isChatHydrated) {
      return
    }
    if (conversationChatIdRef.current !== currentChatId) {
      setCurrentMessage('')
    }
  }, [currentChatId, isChatHydrated])

  useEffect(() => {
    if (!isChatHydrated) {
      return
    }
    const targetChatId = conversationChatIdRef.current ?? currentChatId
    if (!targetChatId) {
      return
    }
    saveMessages(conversation, targetChatId)
  }, [conversation, currentChatId, isChatHydrated, saveMessages])

  useEffect(() => {
    if (!isCurrentChatLoading) {
      textAreaRef.current?.focus()
    }
  }, [isCurrentChatLoading])

  const renderComposer = (showClear?: boolean) => {
    const actionAlignment = showClear ? 'justify-between' : 'justify-end'

    return (
      <div className="relative">
        <div className="bg-background border-border focus-within:ring-ring focus-within:border-ring has-[textarea[aria-invalid=true]]:border-destructive has-[textarea[aria-invalid=true]]:ring-destructive/20 flex flex-col rounded-2xl border shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 focus-within:ring-2 has-[textarea[aria-invalid=true]]:ring-2 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.2)]">
          {(uploadedImages.length > 0 || uploadedDocuments.length > 0) && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {uploadedImages.map((img, index) => (
                <div key={`img-${index}`} className="group relative">
                  <img
                    src={img.url}
                    alt="Upload preview"
                    className="border-border h-20 w-20 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {uploadedDocuments.map((doc, index) => (
                <div
                  key={`doc-${index}`}
                  className="group border-border bg-muted relative flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <span className="max-w-[150px] truncate text-sm" title={doc.name}>
                    {doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="bg-destructive text-destructive-foreground ml-auto rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove document"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative flex min-h-[44px] min-w-0 flex-1 items-start px-4 pt-2 pb-1">
            <label className="sr-only" htmlFor={chatInputId}>
              Message input
            </label>
            <p id={helperTextId} className="sr-only">
              Press Enter to send your message. Use Shift plus Enter to insert a new line.
            </p>
            {!message &&
              !isComposerFocused &&
              uploadedImages.length === 0 &&
              uploadedDocuments.length === 0 && (
                <span className="text-foreground/50 pointer-events-none absolute top-2 left-4 text-base">
                  Ask anything
                </span>
              )}
            <textarea
              ref={textAreaRef}
              rows={1}
              className={textareaClassName}
              value={message}
              disabled={isCurrentChatLoading || !isChatHydrated}
              id={chatInputId}
              aria-invalid={!!composerError}
              aria-describedby={composerError ? `${helperTextId} ${errorTextId}` : helperTextId}
              onFocus={() => setIsComposerFocused(true)}
              onBlur={() => setIsComposerFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setMessage(e.target.value)
                setComposerError(null)
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                handleKeypress(e)
              }}
            />
          </div>

          <div className={`flex items-center justify-between px-3 pb-3`}>
            <div className="flex items-center gap-2">
              {showClear && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-none"
                  disabled={isCurrentChatLoading}
                  onClick={clearMessages}
                >
                  <Eraser className="mr-2 size-4" />
                  Clear chat
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={isCurrentChatLoading || !isChatHydrated}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload image"
                title="Upload image"
              >
                <ImagePlus className="size-4" />
              </Button>
              <input
                ref={documentInputRef}
                type="file"
                accept=".txt,.csv,.pdf,.xlsx,.xls,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                multiple
                className="hidden"
                onChange={handleDocumentUpload}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={isCurrentChatLoading || !isChatHydrated}
                onClick={() => documentInputRef.current?.click()}
                aria-label="Upload document"
                title="Upload document (PDF, TXT, CSV, Excel)"
              >
                <FileText className="size-4" />
              </Button>
            </div>
            {isCurrentChatLoading ? (
              <div
                className="flex items-center justify-center p-2"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={isCurrentChatLoading || !isChatHydrated}
                  onClick={toggleVoiceInput}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  title={isListening ? 'Stop voice input' : 'Start voice input'}
                  className={isListening ? 'text-destructive rounded-full' : 'rounded-full'}
                >
                  {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </Button>
                <Button
                  size="icon-sm"
                  disabled={!canSend}
                  className="rounded-full"
                  onClick={sendMessage}
                  aria-label="Send message"
                  title="Send message"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {composerError && (
          <div
            id={errorTextId}
            className="bg-destructive/10 text-foreground animate-in fade-in slide-in-from-top-1 mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs duration-200"
            role="alert"
          >
            <AlertCircle className="text-destructive size-3.5 shrink-0" />
            <span className="font-medium">{composerError}</span>
          </div>
        )}
      </div>
    )
  }

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[], chatId?: string | null) {
        setConversation(messages, chatId)
      },
      getConversation() {
        return conversationRef.current
      },
      focus: () => {
        textAreaRef.current?.focus()
      }
    }
  }, [setConversation])

  return (
    <div className="bg-background text-foreground relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <StickToBottom
        className="relative min-h-0 flex-1 overflow-y-auto"
        initial="smooth"
        resize="smooth"
      >
        <StickToBottom.Content className="flex min-h-full flex-col">
          {/* Main chat area */}
          <div className="@container/chat mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-3 md:px-6 lg:px-8">
            {!isChatHydrated ? (
              <div className="flex h-full min-h-[60vh] items-center justify-center">
                <div className="text-muted-foreground flex items-center gap-3 text-sm">
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  <span>Loading your chats…</span>
                </div>
              </div>
            ) : conversation.length === 0 ? (
              <div className="flex h-full min-h-[60vh] flex-col items-center justify-center space-y-8">
                <div className="space-y-4 text-center">
                  <div className="bg-secondary text-secondary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h1 className="text-foreground text-3xl font-normal md:text-4xl">
                    Hello, I&apos;m here to help
                  </h1>
                </div>
                <div className="w-full max-w-2xl">{renderComposer()}</div>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((item) => (
                  <Message key={item.id} message={item} />
                ))}
                {currentMessage && (
                  <Message
                    key="streaming"
                    message={{
                      id: 'streaming',
                      createdAt: conversation.at(-1)?.createdAt ?? new Date().toISOString(),
                      content: currentMessage,
                      role: 'assistant'
                    }}
                  />
                )}
              </div>
            )}
          </div>
          {/* Input area - only show at bottom when there are messages */}
          {conversation.length > 0 && (
            <div className="bg-background sticky bottom-0 mt-auto">
              <div className="@container/chat mx-auto w-full max-w-5xl px-4 pt-0 pb-2 md:px-6 lg:px-8">
                {renderComposer(true)}
              </div>
            </div>
          )}
        </StickToBottom.Content>
      </StickToBottom>
    </div>
  )
}

export default forwardRef<ChatRef, object>(Chat)
