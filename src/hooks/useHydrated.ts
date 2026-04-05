import { useSyncExternalStore } from 'react'

const noop = () => () => {}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
