import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query and returns whether it currently matches.
 * Returns undefined during SSR/hydration to avoid mismatch, then updates after mount.
 */
export const useMediaQuery = (query: string): boolean | undefined => {
  const [matches, setMatches] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
