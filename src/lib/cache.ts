import { getItem, removeItem, setItem } from '@/lib/client-storage'
import { AppError } from '@/lib/errors'
import type { JsonValue } from '@/types/json'

const isBrowser = typeof window !== 'undefined'
const storageCache = new Map<string, string | null>()
let areStorageListenersBound = false

function logStorageWarning(action: 'read' | 'write' | 'remove', key: string, error: unknown): void {
  AppError.warn('cache', 'storage_error', `Failed to ${action} localStorage key="${key}"`, error)
}

const storageOptions = { onError: logStorageWarning }

function invalidateStorageCache(key?: string | null): void {
  if (key) {
    storageCache.delete(key)
    return
  }

  storageCache.clear()
}

function bindStorageCacheInvalidation(): void {
  if (!isBrowser || areStorageListenersBound) {
    return
  }

  areStorageListenersBound = true

  window.addEventListener('storage', (event) => {
    invalidateStorageCache(event.key)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      invalidateStorageCache()
    }
  })
}

bindStorageCacheInvalidation()

export function cacheGet(key: string): string | null {
  if (!isBrowser) {
    return null
  }

  if (!storageCache.has(key)) {
    storageCache.set(key, getItem(key, storageOptions))
  }

  return storageCache.get(key) ?? null
}

export function cacheSet(key: string, value: string): void {
  if (isBrowser) {
    storageCache.set(key, value)
    setItem(key, value, storageOptions)
  }
}

export function cacheSetJson<T>(key: string, value: T): void {
  cacheSet(key, JSON.stringify(value))
}

export function cacheRemove(key: string): void {
  if (isBrowser) {
    removeItem(key, storageOptions)
    invalidateStorageCache(key)
  }
}

export function cacheKeysWithPrefix(prefix: string): string[] {
  if (!isBrowser) return []
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) keys.push(key)
    }
  } catch {
    // localStorage access may throw in sandboxed contexts
  }
  return keys
}

export function cacheGetJson(key: string): JsonValue | undefined
export function cacheGetJson(key: string, fallback: JsonValue): JsonValue
export function cacheGetJson(key: string, fallback?: JsonValue): JsonValue | undefined {
  const raw = cacheGet(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as JsonValue
  } catch (error) {
    AppError.warn(
      'cache',
      'corrupt_data',
      `Failed to parse JSON for key="${key}". Removing corrupt entry.`,
      error
    )
    cacheRemove(key)
    return fallback
  }
}
