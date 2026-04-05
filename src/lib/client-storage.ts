export type StorageAction = 'read' | 'write' | 'remove'

interface StorageOptions {
  onError?: (action: StorageAction, key: string, error: unknown) => void
}

function handleStorageError(
  action: StorageAction,
  key: string,
  error: unknown,
  options?: StorageOptions
): void {
  if (options?.onError) {
    options.onError(action, key, error)
    return
  }

  console.warn(`[client-storage] Failed to ${action} localStorage key="${key}"`, error)
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getItem(key: string, options?: StorageOptions): string | null {
  if (!isBrowser()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    handleStorageError('read', key, error, options)
    return null
  }
}

export function setItem(key: string, value: string, options?: StorageOptions): void {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    handleStorageError('write', key, error, options)
  }
}

export function removeItem(key: string, options?: StorageOptions): void {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    handleStorageError('remove', key, error, options)
  }
}
