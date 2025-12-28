import { useCallback, useEffect, useRef, useState } from 'react'

type CopyFn = (text: string) => Promise<boolean>
type UseCopyToClipboardReturn = { copy: CopyFn; copied: boolean }

export const useCopyToClipboard = (resetDelay = 1500): UseCopyToClipboardReturn => {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported')
        setCopied(false)
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        clearResetTimer()
        resetTimerRef.current = setTimeout(() => setCopied(false), resetDelay)
        return true
      } catch (error) {
        console.warn('Copy failed', error)
        setCopied(false)
        return false
      }
    },
    [clearResetTimer, resetDelay]
  )

  useEffect(() => {
    return () => {
      clearResetTimer()
    }
  }, [clearResetTimer])

  return { copy, copied }
}
