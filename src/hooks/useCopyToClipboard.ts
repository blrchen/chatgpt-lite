import { useCallback, useEffect, useRef, useState } from 'react'

type CopyFn = (text: string) => Promise<boolean>
type UseCopyToClipboardReturn = { copy: CopyFn; copied: boolean }

export function useCopyToClipboard(resetDelay = 1500): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), resetDelay)
        return true
      } catch (error) {
        console.warn('Copy failed', error)
        setCopied(false)
        return false
      }
    },
    [resetDelay]
  )

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return { copy, copied }
}
