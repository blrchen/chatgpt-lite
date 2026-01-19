'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function VoiceChat() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [interimTranscript, setInterimTranscript] = useState('')
  const [autoMode, setAutoMode] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'zh-CN'

        recognition.onresult = (event: any) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript
            } else {
              interim += transcript
            }
          }

          setInterimTranscript(interim)

          if (final) {
            handleUserMessage(final)
            setInterimTranscript('')
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setIsListening(false)
            toast.error('Speech recognition error: ' + event.error)
          }
        }

        recognition.onend = () => {
          if (autoMode && !isSpeaking) {
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
  }, [autoMode, isSpeaking])

  const handleUserMessage = async (text: string) => {
    const userMessage: Message = {
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

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'You are a helpful voice assistant. Respond concisely and naturally.',
          messages: conversationHistoryRef.current.slice(-10), // Keep last 10 messages for context
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

          const chunk = decoder.decode(value)
          assistantText += chunk
        }
      }

      const assistantMessage: Message = {
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
    }
  }

  const speakText = (text: string) => {
    if (!synthRef.current) {
      setIsProcessing(false)
      return
    }

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsProcessing(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      currentUtteranceRef.current = null

      // Resume listening in auto mode
      if (autoMode && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start()
            setIsListening(true)
          } catch (e) {
            console.error('Failed to restart listening:', e)
          }
        }, 500)
      }
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      setIsProcessing(false)
      currentUtteranceRef.current = null
    }

    currentUtteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

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
    if (synthRef.current) {
      synthRef.current.cancel()
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
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold">Voice Conversation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Talk naturally with AI - it can interrupt and respond in real-time
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-primary/50 text-primary-foreground">
                <p className="text-sm italic">{interimTranscript}</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 bg-muted text-foreground">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-border px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Status indicators */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {isListening ? 'Listening' : 'Not listening'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {isSpeaking ? 'Speaking' : 'Silent'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  autoMode ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {autoMode ? 'Auto mode' : 'Manual mode'}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={toggleListening}
              disabled={isSpeaking || isProcessing}
              className="h-16 w-16 rounded-full"
            >
              {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </Button>

            {isSpeaking && (
              <Button
                size="lg"
                variant="outline"
                onClick={stopSpeaking}
                className="h-16 w-16 rounded-full"
              >
                <Square className="size-6" />
              </Button>
            )}

            <Button
              size="lg"
              variant={autoMode ? 'default' : 'outline'}
              onClick={toggleAutoMode}
              disabled={isProcessing}
            >
              {autoMode ? 'Disable Auto' : 'Enable Auto'}
            </Button>

            <Button size="lg" variant="outline" onClick={clearConversation}>
              Clear
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {autoMode
              ? 'Auto mode: Speak anytime, AI will respond automatically'
              : 'Manual mode: Click microphone to speak, AI will respond when you finish'}
          </p>
        </div>
      </div>
    </div>
  )
}
