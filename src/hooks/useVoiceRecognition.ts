import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance
} from '@/types/speech-recognition'
import { toast } from 'sonner'

interface UseVoiceRecognitionOptions {
  onTranscript: (text: string) => void
}

interface UseVoiceRecognitionReturn {
  isListening: boolean
  interimTranscript: string
  toggleVoiceInput: () => void
  resetTranscript: () => void
}

export function useVoiceRecognition({
  onTranscript
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const isManualStopRef = useRef<boolean>(false)
  const isListeningRef = useRef<boolean>(false)
  const onTranscriptEvent = useEffectEvent(onTranscript)

  const stopListening = useCallback((manualStop: boolean): void => {
    setIsListening(false)
    isListeningRef.current = false
    isManualStopRef.current = manualStop
  }, [])

  const startListening = useCallback((): void => {
    setInterimTranscript('')
    setIsListening(true)
    isListeningRef.current = true
    isManualStopRef.current = false
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

      setInterimTranscript(interim)

      if (finalTranscript) {
        onTranscriptEvent(finalTranscript)
        setInterimTranscript('')
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)

      switch (event.error) {
        case 'not-allowed': {
          stopListening(true)
          toast.error('Microphone access denied. Please allow microphone access in your browser.')
          break
        }
        case 'no-speech':
        case 'aborted':
          break
        default: {
          stopListening(true)
          toast.error('Speech recognition error: ' + event.error)
          break
        }
      }
    }

    recognition.onend = () => {
      if (isManualStopRef.current) {
        stopListening(false)
        return
      }

      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch (error) {
          console.error('Failed to auto-restart speech recognition:', error)
          stopListening(false)
        }
      } else {
        stopListening(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      const recognitionInstance = recognitionRef.current
      if (recognitionInstance) {
        recognitionInstance.onresult = null
        recognitionInstance.onerror = null
        recognitionInstance.onend = null
        recognitionInstance.stop()
        recognitionRef.current = null
      }
    }
  }, [stopListening])

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return
    }

    if (isListeningRef.current) {
      try {
        isManualStopRef.current = true
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
        stopListening(true)
      }
    } else {
      try {
        recognitionRef.current.start()
        startListening()
        toast.success('Listening… Speak now')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        stopListening(false)
        toast.error('Failed to start speech recognition')
      }
    }
  }, [startListening, stopListening])

  const resetTranscript = useCallback(() => {
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    interimTranscript,
    toggleVoiceInput,
    resetTranscript
  }
}
