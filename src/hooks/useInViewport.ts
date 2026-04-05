import { startTransition, useCallback, useEffect, useState, type RefCallback } from 'react'

export function useInViewport<T extends Element>(): [RefCallback<T>, boolean] {
  const [node, setNode] = useState<T | null>(null)
  const [isInView, setIsInView] = useState(true)

  const ref = useCallback<RefCallback<T>>((nextNode) => {
    setNode(nextNode)
    if (nextNode && typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
    }
  }, [])

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) {
        return
      }

      startTransition(() => {
        setIsInView(entry.isIntersecting)
      })
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return [ref, isInView]
}
