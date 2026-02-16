'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance
} from '@/types/speech-recognition'
import { Mic, MicOff, Square } from 'lucide-react'
import { toast } from 'sonner'

type VoiceMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ConversationHistoryEntry = Pick<VoiceMessage, 'role' | 'content'>

export function VoiceChat(): React.JSX.Element {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [interimTranscript, setInterimTranscript] = useState('')
  const [autoMode, setAutoMode] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const conversationHistoryRef = useRef<ConversationHistoryEntry[]>([])
  const autoModeRef = useRef(autoMode)
  const isSpeakingRef = useRef(isSpeaking)
  const handleUserMessageRef = useRef<((text: string) => Promise<void>) | null>(null)
  const lastFinalTranscriptRef = useRef<string>('')
  const isProcessingRef = useRef(false)

  useEffect(() => {
    autoModeRef.current = autoMode
  }, [autoMode])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'zh-CN'

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript
            if (result.isFinal) {
              finalTranscript += transcript
            } else {
              interim += transcript
            }
          }

          setInterimTranscript(interim)

          if (finalTranscript) {
            // Prevent duplicate messages: skip if same as last final or already processing
            const trimmed = finalTranscript.trim()
            if (trimmed && trimmed !== lastFinalTranscriptRef.current && !isProcessingRef.current) {
              lastFinalTranscriptRef.current = trimmed
              void handleUserMessageRef.current?.(trimmed)
            }
            setInterimTranscript('')
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setIsListening(false)
            toast.error('Speech recognition error: ' + event.error)
          }
        }

        recognition.onend = () => {
          if (autoModeRef.current && !isSpeakingRef.current) {
            // Restart listening in auto mode
            try {
              recognition.start()
            } catch (e) {
              console.error('Failed to restart recognition:', e)
            }
          } else {
            setIsListening(false)
          }
        }

        recognitionRef.current = recognition
      }

      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  function speakText(text: string): void {
    if (!synthRef.current) {
      setIsProcessing(false)
      isProcessingRef.current = false
      lastFinalTranscriptRef.current = ''
      return
    }

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => {
      isSpeakingRef.current = true
      setIsSpeaking(true)
      setIsProcessing(false)
      isProcessingRef.current = false
    }

    utterance.onend = () => {
      isSpeakingRef.current = false
      setIsSpeaking(false)
      currentUtteranceRef.current = null
      lastFinalTranscriptRef.current = '' // Reset to allow same message to be sent again

      // Resume listening in auto mode
      if (autoModeRef.current && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
            setIsListening(true)
          } catch (e) {
            console.error('Failed to restart listening:', e)
          }
        }, 500)
      }
    }

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error:', event)
      isSpeakingRef.current = false
      setIsSpeaking(false)
      setIsProcessing(false)
      isProcessingRef.current = false
      currentUtteranceRef.current = null
      lastFinalTranscriptRef.current = ''
    }

    currentUtteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  async function handleUserMessage(text: string): Promise<void> {
    const userMessage: VoiceMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    conversationHistoryRef.current.push({ role: 'user', content: text })

    // Stop listening while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setIsProcessing(true)
    isProcessingRef.current = true

    try {
      // Call chat API
      const contextMessages = conversationHistoryRef.current.slice(0, -1)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'You are a helpful voice assistant. Respond concisely and naturally.',
          messages: contextMessages.slice(-10), // Keep last 10 prior messages for context
          input: text
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantText += chunk
        }
        assistantText += decoder.decode()
      }

      const assistantMessage: VoiceMessage = {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, assistantMessage])
      conversationHistoryRef.current.push({ role: 'assistant', content: assistantText })

      // Speak the response
      speakText(assistantText)
    } catch (error) {
      console.error('Error getting response:', error)
      toast.error('Failed to get response from AI')
      setIsProcessing(false)
      isProcessingRef.current = false
      lastFinalTranscriptRef.current = '' // Reset to allow same message to be sent again if needed
    }
  }

  handleUserMessageRef.current = handleUserMessage

  const toggleListening = useCallback(() => {
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
        toast.success('Listening...')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Failed to start speech recognition')
      }
    }
  }, [isListening])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      isSpeakingRef.current = false
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }
  }, [])

  const toggleAutoMode = useCallback(() => {
    const newAutoMode = !autoMode
    setAutoMode(newAutoMode)

    if (newAutoMode && !isListening && !isSpeaking && recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.success('Auto conversation mode enabled')
      } catch (e) {
        console.error('Failed to start auto mode:', e)
      }
    } else if (!newAutoMode) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      }
      toast.success('Auto conversation mode disabled')
    }
  }, [autoMode, isListening, isSpeaking])

  const clearConversation = useCallback(() => {
    setMessages([])
    conversationHistoryRef.current = []
    setInterimTranscript('')
    isProcessingRef.current = false
    lastFinalTranscriptRef.current = ''
    if (synthRef.current) {
      synthRef.current.cancel()
      isSpeakingRef.current = false
      currentUtteranceRef.current = null
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
    setIsSpeaking(false)
    setIsProcessing(false)
    toast.success('Conversation cleared')
  }, [isListening])

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="border-border border-b px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4">
        <h1 className="text-foreground font-display text-2xl font-medium tracking-tight text-balance">
          Voice Conversation
        </h1>
        <p className="text-muted-foreground mt-1 text-sm text-pretty">
          Talk naturally with AI - it can interrupt and respond in real-time
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="text-sm text-pretty break-words whitespace-pre-wrap">
                  {message.content}
                </p>
                <p
                  className={cn(
                    'mt-1 text-xs tabular-nums',
                    message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {interimTranscript && (
            <div className="flex justify-end">
              <div className="bg-primary/90 text-primary-foreground max-w-[80%] rounded-2xl px-4 py-2.5">
                <p className="text-sm text-pretty break-words whitespace-pre-wrap italic">
                  {interimTranscript}
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground max-w-[80%] rounded-2xl px-4 py-2.5">
                <p className="text-sm text-pretty">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="border-border border-t px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          {/* Status indicators */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'size-3 rounded-full',
                  isListening ? 'bg-primary animate-pulse motion-reduce:animate-none' : 'bg-muted'
                )}
              />
              <span className="text-muted-foreground text-sm">
                {isListening ? 'Listening' : 'Not listening'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'size-3 rounded-full',
                  isSpeaking ? 'bg-accent animate-pulse motion-reduce:animate-none' : 'bg-muted'
                )}
              />
              <span className="text-muted-foreground text-sm">
                {isSpeaking ? 'Speaking' : 'Silent'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'size-3 rounded-full',
                  autoMode
                    ? 'bg-secondary-foreground animate-pulse motion-reduce:animate-none'
                    : 'bg-muted'
                )}
              />
              <span className="text-muted-foreground text-sm">
                {autoMode ? 'Auto mode' : 'Manual mode'}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={toggleListening}
              disabled={isSpeaking || isProcessing}
              className="disabled:bg-muted disabled:text-muted-foreground size-16 rounded-full disabled:opacity-100"
            >
              {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </Button>

            {isSpeaking && (
              <Button
                size="lg"
                variant="outline"
                onClick={stopSpeaking}
                className="size-16 rounded-full"
              >
                <Square className="size-6" />
              </Button>
            )}

            <Button
              size="lg"
              variant={autoMode ? 'default' : 'outline'}
              onClick={toggleAutoMode}
              disabled={isProcessing}
              className="disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
            >
              {autoMode ? 'Disable Auto' : 'Enable Auto'}
            </Button>

            <Button size="lg" variant="outline" onClick={clearConversation}>
              Clear
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-center text-sm text-pretty">
            {autoMode
              ? 'Auto mode: Speak anytime, AI will respond automatically'
              : 'Manual mode: Click microphone to speak, AI will respond when you finish'}
          </p>
        </div>
      </div>
    </div>
  )
}
