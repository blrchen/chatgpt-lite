'use client'

const isBrowser = () => typeof window !== 'undefined'

export const cacheGet = (key: string): string | null => {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(key)
}

export const cacheSet = (key: string, value: string) => {
  if (!isBrowser()) {
    return
  }

  localStorage.setItem(key, value)
}

export const cacheRemove = (key: string) => {
  if (!isBrowser()) {
    return
  }

  localStorage.removeItem(key)
}

export const cacheGetJson = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) {
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
