const isBrowser = typeof window !== 'undefined'

export function cacheGet(key: string): string | null {
  return isBrowser ? localStorage.getItem(key) : null
}

export function cacheSet(key: string, value: string): void {
  if (isBrowser) {
    localStorage.setItem(key, value)
  }
}

export function cacheSetJson<T>(key: string, value: T): void {
  cacheSet(key, JSON.stringify(value))
}

export function cacheRemove(key: string): void {
  if (isBrowser) {
    localStorage.removeItem(key)
  }
}

export function cacheGetJson<T>(key: string, fallback: T): T {
  if (!isBrowser) {
    return fallback
  }
  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}
