import { useCallback } from 'react'

type CopyFn = (text: string, callback?: (data: any) => void) => Promise<boolean> // Return success

export const useCopyToClipboard = (): CopyFn => {
  const copy: CopyFn = useCallback(async (text, callback) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      callback?.(false)
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      callback?.(true)
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      callback?.(false)
      return false
    }
  }, [])

  return copy
}
