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
import { Button } from '@/components/ui/button'
import { UIMessage, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
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
import { Message } from './message'
import { usePersonaContext } from './personaContext'

type MessageContent =
  | string
  | Array<
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
    >

export interface ChatRef {
  setConversation: (messages: UIMessage[], chatId?: string | null) => void
  getConversation: () => UIMessage[]
  focus: () => void
}

type ConversationUpdater = UIMessage[] | ((prev: UIMessage[]) => UIMessage[])

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
      images?: Array<{
        pageNumber: number
        name: string
        width: number
        height: number
        dataUrl: string
      }>
    }>
  >([])

  const [isListening, setIsListening] = useState(false)

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const documentInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const isManualStopRef = useRef<boolean>(false)
  const isListeningRef = useRef<boolean>(false)

  // Get persona prompt for current chat
  const activeChat = currentChat || getChatById(currentChatId)
  const personaForChat =
    activeChat?.persona?.id && getPersonaById
      ? (getPersonaById(activeChat.persona.id) ?? activeChat.persona)
      : activeChat?.persona
  const personaPrompt = personaForChat?.prompt?.trim() ?? ''

  // Use AI SDK's useChat hook
  const {
    messages: uiMessages,
    sendMessage: sendAIMessage,
    status,
    setMessages: setUIMessages,
    error: chatError,
    stop,
    regenerate
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        prompt: personaPrompt
      }
    }),
    onError: (error) => {
      console.error('[Chat Error]', error)
      toast.error(error.message || 'Failed to send message')
      setComposerError('Unable to send message. Please try again.')
    },
    onFinish: ({ message, messages, isAbort, isDisconnect, isError }) => {
      console.log('[Chat] Message finished', {
        messageId: message.id,
        isAbort,
        isDisconnect,
        isError,
        metadata: message.metadata
      })
      // Save to context after stream completes (UIMessages directly)
      saveMessages(messages, currentChatId || undefined, { chat: activeChat })
    }
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Use UI messages directly without conversion
  const conversation: UIMessage[] = uiMessages
  const conversationRef = useRef<UIMessage[]>(conversation)
  const conversationChatIdRef = useRef<string | undefined>(currentChatId || undefined)
  const activeChatIdRef = useRef<string | null>(currentChatId)

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  useEffect(() => {
    activeChatIdRef.current = currentChatId ?? null
  }, [currentChatId])

  // Sync conversation with chat context
  const setConversation = useCallback(
    (updater: ConversationUpdater, chatId?: string | null) => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: UIMessage[]) => UIMessage[])(conversationRef.current)
          : updater

      setUIMessages(next)
      conversationRef.current = next
      const resolvedChatId =
        chatId === null ? undefined : (chatId ?? currentChatId ?? conversationChatIdRef.current)
      conversationChatIdRef.current = resolvedChatId
    },
    [currentChatId, setUIMessages]
  )

  const chatInputId = useId()
  const helperTextId = useId()
  const errorTextId = useId()
  const isCurrentChatLoading = isLoading
  const hasActiveChat = Boolean(currentChatId ?? conversationChatIdRef.current)
  const getComposerValue = useCallback(() => textAreaRef.current?.value ?? message ?? '', [message])
  const getComposerText = useCallback(() => getComposerValue().trim(), [getComposerValue])
  const canSend =
    isChatHydrated &&
    hasActiveChat &&
    status === 'ready' &&
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
      const fileName = file.name.toLowerCase()
      const isImage =
        file.type.startsWith('image/') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.gif') ||
        fileName.endsWith('.webp') ||
        fileName.endsWith('.heic') ||
        fileName.endsWith('.heif')

      if (!isImage) {
        toast.error('Please upload an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        const mimeType = file.type || `image/${fileName.split('.').pop()}`
        setUploadedImages((prev) => [...prev, { url: base64, mimeType }])
      }
      reader.onerror = (error) => {
        console.error('Error reading file:', error)
        toast.error(`Failed to load image: ${file.name}`)
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
        recognition.lang = 'zh-CN'

        recognition.onresult = (event: any) => {
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }

          if (finalTranscript) {
            setMessage((prev) => prev + finalTranscript)
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)

          if (event.error === 'not-allowed') {
            setIsListening(false)
            isListeningRef.current = false
            isManualStopRef.current = true
            toast.error('Microphone access denied. Please allow microphone access in your browser.')
          } else if (event.error === 'no-speech') {
            console.log('No speech detected, will auto-restart if still listening')
          } else if (event.error === 'aborted') {
            console.log('Speech recognition aborted')
          } else {
            setIsListening(false)
            isListeningRef.current = false
            isManualStopRef.current = true
            toast.error('Speech recognition error: ' + event.error)
          }
        }

        recognition.onend = () => {
          if (isManualStopRef.current) {
            setIsListening(false)
            isListeningRef.current = false
            isManualStopRef.current = false
            return
          }

          if (isListeningRef.current) {
            try {
              recognition.start()
              console.log('Auto-restarting speech recognition')
            } catch (error) {
              console.error('Failed to auto-restart speech recognition:', error)
              setIsListening(false)
              isListeningRef.current = false
            }
          } else {
            setIsListening(false)
            isListeningRef.current = false
          }
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
      try {
        isManualStopRef.current = true
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
        isManualStopRef.current = true
        setIsListening(false)
        isListeningRef.current = false
      }
    } else {
      try {
        isManualStopRef.current = false
        recognitionRef.current.start()
        setIsListening(true)
        isListeningRef.current = true
        toast.success('Listening... Speak now')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setIsListening(false)
        isListeningRef.current = false
        toast.error('Failed to start speech recognition')
      }
    }
  }, [isListening])

  const sendMessage = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (status !== 'ready') {
        return
      }

      e?.preventDefault()
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
            images: doc.images
          })
        })
        messageContent = contentParts
      }

      setComposerError(null)
      setMessage('')
      setUploadedImages([])
      setUploadedDocuments([])

      try {
        // Use AI SDK's sendMessage to send message
        await sendAIMessage({
          text: typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent)
        })
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : 'Unknown error')
        setComposerError('Something went wrong. Please try again.')
      }
    },
    [
      status,
      isChatHydrated,
      ensureActiveChat,
      getComposerText,
      uploadedImages,
      uploadedDocuments,
      personaPrompt,
      sendAIMessage
    ]
  )

  const handleKeypress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault()
        if (!isChatHydrated || status !== 'ready') {
          return
        }
        const input = getComposerText()
        if (!input && uploadedImages.length === 0 && uploadedDocuments.length === 0) {
          setComposerError('Please enter a message to continue.')
          return
        }
        // Call sendMessage without event parameter
        void sendMessage(e as any)
      }
    },
    [
      getComposerText,
      isChatHydrated,
      isComposing,
      status,
      sendMessage,
      uploadedImages,
      uploadedDocuments
    ]
  )

  const handleSendClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      void sendMessage(e)
    },
    [sendMessage]
  )

  const clearMessages = () => {
    if (status !== 'ready') {
      return
    }
    setConversation([], currentChatId)
    setUploadedImages([])
    setUploadedDocuments([])
  }

  useEffect(() => {
    if (currentChatId) {
      conversationChatIdRef.current = currentChatId
    }
  }, [currentChatId])

  useEffect(() => {
    if (status === 'ready') {
      textAreaRef.current?.focus()
    }
  }, [status])

  // Load conversation when chat changes
  useEffect(() => {
    if (currentChat?.id && isChatHydrated) {
      // Messages are already in UIMessage format from context
      const chatMessages = conversationRef.current
      if (chatMessages.length > 0) {
        setUIMessages(chatMessages)
      }
    }
  }, [currentChat?.id, isChatHydrated, setUIMessages])

  const renderComposer = (showClear?: boolean) => {
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
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
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
                    className="bg-destructive text-destructive-foreground ml-auto rounded-full p-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
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
              disabled={status !== 'ready' || !isChatHydrated}
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
                  disabled={status !== 'ready'}
                  onClick={clearMessages}
                >
                  <Eraser className="mr-2 size-4" />
                  Clear chat
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={status !== 'ready' || !isChatHydrated}
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
                disabled={status !== 'ready' || !isChatHydrated}
                onClick={() => documentInputRef.current?.click()}
                aria-label="Upload document"
                title="Upload document (PDF, TXT, CSV, Excel)"
              >
                <FileText className="size-4" />
              </Button>
            </div>
            {isCurrentChatLoading ? (
              <div className="flex gap-2">
                {status === 'submitted' && (
                  <div
                    className="flex items-center justify-center p-2"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2 className="text-muted-foreground size-5 animate-spin" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => stop()}
                  aria-label="Stop generation"
                  title="Stop generation"
                >
                  Stop
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={status !== 'ready' || !isChatHydrated}
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
                  onClick={handleSendClick}
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
            {chatError && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-6 px-2 text-xs"
                onClick={() => {
                  setComposerError(null)
                  regenerate()
                }}
              >
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: UIMessage[], chatId?: string | null) {
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
              </div>
            )}
          </div>
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
