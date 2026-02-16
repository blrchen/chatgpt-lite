'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import {
  isDocumentFile,
  isImageFile,
  readFileAsDataUrl,
  type UploadedDocument,
  type UploadedImage
} from '@/components/chat/chat-attachments'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance
} from '@/types/speech-recognition'
import {
  AlertCircle,
  ArrowUp,
  Eraser,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  X
} from 'lucide-react'
import { toast } from 'sonner'

const TEXTAREA_CLASS_NAME =
  'text-foreground w-full min-w-0 resize-none !border-0 !bg-transparent text-base leading-relaxed break-words !outline-none !shadow-none focus:!outline-none focus:!border-0 focus:!ring-0 focus-visible:!outline-none focus-visible:!border-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 max-h-[200px] min-h-[24px] overflow-y-auto [field-sizing:content]'

export interface ChatComposerHandle {
  focus: () => void
}

export interface ChatComposerPayload {
  text: string
  uploadedImages: UploadedImage[]
  uploadedDocuments: UploadedDocument[]
}

export interface ChatComposerProps {
  isChatHydrated: boolean
  isSending: boolean
  hasActiveChat: boolean
  showClear: boolean
  composerError: string | null
  setComposerError: (next: string | null) => void
  onClear: () => void
  onSend: (payload: ChatComposerPayload) => Promise<boolean> | boolean
}

export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(function ChatComposer(
  {
    isChatHydrated,
    isSending,
    hasActiveChat,
    showClear,
    composerError,
    setComposerError,
    onClear,
    onSend
  },
  ref
) {
  const [message, setMessage] = useState('')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isManualStopRef = useRef<boolean>(false)
  const isListeningRef = useRef<boolean>(false)
  const interimTranscriptRef = useRef<string>('')

  const chatInputId = useId()
  const helperTextId = useId()
  const errorTextId = useId()

  const hasText = message.trim().length > 0
  const hasAttachments = uploadedImages.length > 0 || uploadedDocuments.length > 0
  const hasContent = hasText || hasAttachments
  const canSend = isChatHydrated && hasActiveChat && !isSending && hasContent

  useImperativeHandle(ref, () => ({
    focus: () => {
      textAreaRef.current?.focus()
    }
  }))

  const getComposerText = useCallback(
    () => (textAreaRef.current?.value ?? message ?? '').trim(),
    [message]
  )

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let parseFileFn: ((file: File) => Promise<UploadedDocument>) | null = null

    for (const file of Array.from(files)) {
      if (isImageFile(file)) {
        readFileAsDataUrl(file)
          .then((base64) => {
            const mimeType = file.type || `image/${file.name.split('.').pop()}`
            setUploadedImages((prev) => [...prev, { url: base64, mimeType, name: file.name }])
          })
          .catch((error) => {
            console.error('Error reading file:', error)
            toast.error(`Failed to load image: ${file.name}`)
          })
        continue
      }

      if (isDocumentFile(file)) {
        try {
          if (!parseFileFn) {
            const { parseFile } = await import('@/lib/file-parser')
            parseFileFn = parseFile
          }

          const parsed = await parseFileFn!(file)
          setUploadedDocuments((prev) => [...prev, parsed])
          toast.success(`File "${file.name}" uploaded successfully`)
        } catch (error) {
          console.error('Error parsing file:', error)
          toast.error(`Failed to parse file: ${file.name}`)
        }
        continue
      }

      toast.error(`Unsupported file type: ${file.name}`)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const removeDocument = useCallback((index: number) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    const preferredLanguage = navigator.language || document.documentElement.lang || 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = preferredLanguage

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }

      interimTranscriptRef.current = interim
      setInterimTranscript(interim)

      if (finalTranscript) {
        setMessage((prev) => prev + finalTranscript)
        interimTranscriptRef.current = ''
        setInterimTranscript('')
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)

      switch (event.error) {
        case 'not-allowed': {
          setIsListening(false)
          isListeningRef.current = false
          isManualStopRef.current = true
          toast.error('Microphone access denied. Please allow microphone access in your browser.')
          break
        }
        case 'no-speech': {
          console.log('No speech detected, will auto-restart if still listening')
          break
        }
        case 'aborted': {
          console.log('Speech recognition aborted')
          break
        }
        default: {
          setIsListening(false)
          isListeningRef.current = false
          isManualStopRef.current = true
          toast.error('Speech recognition error: ' + event.error)
          break
        }
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

    return () => {
      const recognition = recognitionRef.current
      if (recognition) {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items
    if (!items) return

    let didPreventDefault = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item?.type?.startsWith('image/')) continue

      if (!didPreventDefault) {
        event.preventDefault()
        didPreventDefault = true
      }

      const file = item.getAsFile()
      if (!file) continue

      readFileAsDataUrl(file)
        .then((base64) => {
          setUploadedImages((prev) => [...prev, { url: base64, mimeType: file.type }])
        })
        .catch(() => {
          toast.error('Failed to load pasted image')
        })
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
        interimTranscriptRef.current = ''
        setInterimTranscript('')
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent | React.MouseEvent) => {
      e.preventDefault()

      if (isSending) {
        return
      }

      if (!isChatHydrated || !hasActiveChat) {
        setComposerError('Setting up your chat. Please wait a moment.')
        return
      }

      const input = getComposerText()
      if (!input && !hasAttachments) {
        setComposerError('Please enter a message or upload a file to continue.')
        return
      }

      const accepted = await onSend({
        text: input,
        uploadedImages,
        uploadedDocuments
      })

      if (!accepted) {
        return
      }

      setMessage('')
      setUploadedImages([])
      setUploadedDocuments([])
      setInterimTranscript('')
    },
    [
      getComposerText,
      hasActiveChat,
      hasAttachments,
      isChatHydrated,
      isSending,
      onSend,
      setComposerError,
      uploadedDocuments,
      uploadedImages
    ]
  )

  const handleClear = useCallback(() => {
    onClear()
    setMessage('')
    setUploadedImages([])
    setUploadedDocuments([])
    setInterimTranscript('')
    setComposerError(null)
  }, [onClear, setComposerError])

  const handleKeypress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault()
        if (!canSend) {
          return
        }
        handleSubmit(e)
      }
    },
    [canSend, handleSubmit, isComposing]
  )

  const showPlaceholder = !message && !isComposerFocused && !hasAttachments

  return (
    <div className="relative">
      <div className="bg-card border-border/60 focus-within:border-primary/30 focus-within:ring-primary/10 has-[textarea[aria-invalid=true]]:border-destructive has-[textarea[aria-invalid=true]]:ring-destructive/20 flex flex-col rounded-2xl border shadow-md transition-[border-color,box-shadow] duration-200 focus-within:shadow-lg focus-within:ring-4 has-[textarea[aria-invalid=true]]:ring-2">
        {hasAttachments && (
          <div className="flex flex-wrap gap-2.5 px-4 pt-3">
            {uploadedImages.map((img, index) => (
              <div
                key={`img-${index}`}
                className="animate-in fade-in zoom-in-95 group relative duration-200 motion-reduce:animate-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="Upload preview"
                  className="border-border/50 size-20 rounded-xl border object-cover shadow-sm transition-shadow duration-200 group-hover:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="group/remove focus-visible:ring-ring/50 focus-visible:ring-offset-background absolute -top-1.5 -right-1.5 flex size-11 items-center justify-center opacity-100 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:size-9 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  aria-label="Remove image"
                >
                  <span className="bg-destructive/90 text-destructive-foreground flex size-7 items-center justify-center rounded-full shadow-sm transition-transform duration-200 group-hover/remove:scale-110">
                    <X className="size-3.5" />
                  </span>
                </button>
              </div>
            ))}
            {uploadedDocuments.map((doc, index) => (
              <div
                key={`doc-${index}`}
                className="animate-in fade-in slide-in-from-bottom-1 group border-border/50 bg-muted/50 relative flex items-center gap-2.5 rounded-xl border py-2 pr-12 pl-3 shadow-sm transition-shadow duration-200 hover:shadow-md motion-reduce:animate-none"
              >
                <span className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="text-primary/70 size-3.5" />
                </span>
                <span className="max-w-[150px] truncate text-sm font-medium" title={doc.name}>
                  {doc.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="group/remove focus-visible:ring-ring/50 focus-visible:ring-offset-background absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center opacity-100 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:size-9 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                  aria-label="Remove document"
                >
                  <span className="bg-destructive/90 text-destructive-foreground flex size-7 items-center justify-center rounded-full shadow-sm transition-transform duration-200 group-hover/remove:scale-110">
                    <X className="size-3.5" />
                  </span>
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
          {showPlaceholder && !interimTranscript && (
            <span className="text-foreground/60 pointer-events-none absolute top-2 left-4 font-serif text-base leading-relaxed italic">
              Ask me anything
            </span>
          )}
          {interimTranscript && (
            <span className="text-foreground pointer-events-none absolute top-2 left-4 text-base leading-relaxed">
              {message}
              <span className="animate-pulse motion-reduce:animate-none">{interimTranscript}</span>
            </span>
          )}
          <textarea
            ref={textAreaRef}
            rows={1}
            className={cn(
              TEXTAREA_CLASS_NAME,
              interimTranscript && 'text-transparent caret-transparent'
            )}
            value={message}
            disabled={isSending || !isChatHydrated}
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
            onKeyDown={handleKeypress}
            onPaste={handlePaste}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif,.txt,.csv,.pdf,.xlsx,.xls,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={isSending || !isChatHydrated}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/5 group/attach disabled:bg-muted/40 disabled:text-muted-foreground size-11 rounded-full transition-colors duration-200 disabled:opacity-100 md:size-8"
                >
                  <Paperclip className="size-4 transition-transform duration-200 group-hover/attach:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Attach file (images, PDF, TXT, CSV, Excel)
              </TooltipContent>
            </Tooltip>
            {showClear && (
              <Button
                size="sm"
                variant="outline"
                className="group/clear hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/40 rounded-lg shadow-none transition-colors duration-200 disabled:opacity-100"
                disabled={isSending}
                onClick={handleClear}
              >
                <Eraser className="mr-1.5 size-3.5 transition-transform duration-200 group-hover/clear:rotate-12" />
                <span className="text-xs font-medium">Clear history</span>
              </Button>
            )}
          </div>
          {isSending ? (
            <div className="flex items-center justify-center p-2" role="status" aria-live="polite">
              <div className="relative">
                <Loader2 className="text-primary/60 size-5 animate-spin motion-reduce:animate-none" />
                <div className="bg-primary/10 absolute inset-0 -z-10 scale-150 rounded-full blur-md" />
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={isSending || !isChatHydrated}
                    onClick={toggleVoiceInput}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    className={cn(
                      'disabled:bg-muted/40 disabled:text-muted-foreground size-11 rounded-full disabled:opacity-100 md:size-8',
                      isListening
                        ? 'text-destructive relative'
                        : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 group/mic transition-colors duration-200'
                    )}
                  >
                    {isListening && (
                      <>
                        <span className="bg-destructive/25 absolute inset-0 animate-[voice-ring_1.5s_ease-out_infinite] rounded-full motion-reduce:animate-none" />
                        <span className="bg-destructive/15 absolute inset-0 animate-[voice-ring_1.5s_ease-out_0.4s_infinite] rounded-full motion-reduce:animate-none" />
                      </>
                    )}
                    {isListening ? (
                      <MicOff className="relative size-4" />
                    ) : (
                      <Mic className="size-4 transition-transform duration-200 group-hover/mic:scale-110" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isListening ? 'Stop voice input' : 'Start voice input'}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    disabled={!canSend}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground group/send relative size-11 overflow-hidden rounded-full transition-[transform,box-shadow] duration-200 hover:scale-105 hover:shadow-lg active:scale-90 disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:scale-100 disabled:hover:shadow-none md:size-8"
                    onClick={handleSubmit}
                    aria-label="Send message"
                  >
                    <ArrowUp className="size-4 transition-transform duration-150 group-hover/send:-translate-y-0.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Send message
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      {composerError && (
        <div
          id={errorTextId}
          className="border-destructive/20 bg-destructive/5 text-foreground animate-in fade-in slide-in-from-top-2 mt-3 flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm shadow-sm duration-200 motion-reduce:animate-none"
          role="alert"
        >
          <span className="bg-destructive/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive size-3" />
          </span>
          <span className="text-foreground/90 font-serif text-xs leading-relaxed italic">
            {composerError}
          </span>
        </div>
      )}
    </div>
  )
})
