import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const ELLIPSIS = '...'
const ELLIPSIS_LENGTH = ELLIPSIS.length

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

function truncateMiddle(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  if (maxLength <= ELLIPSIS_LENGTH) return value.slice(0, maxLength)

  const visibleLength = maxLength - ELLIPSIS_LENGTH
  const headLength = Math.ceil(visibleLength / 2)
  const tailLength = Math.floor(visibleLength / 2)

  return `${value.slice(0, headLength)}${ELLIPSIS}${value.slice(-tailLength)}`
}

export function truncateFilenameMiddle(filename: string, maxLength = 18): string {
  if (filename.length <= maxLength) return filename
  if (maxLength <= ELLIPSIS_LENGTH) return filename.slice(0, maxLength)

  const lastDotIndex = filename.lastIndexOf('.')
  const hasExtension = lastDotIndex > 0 && lastDotIndex < filename.length - 1

  if (!hasExtension) {
    return truncateMiddle(filename, maxLength)
  }

  const nameWithoutExtension = filename.slice(0, lastDotIndex)
  const extension = filename.slice(lastDotIndex)
  const preservedNameLength = maxLength - ELLIPSIS_LENGTH - extension.length

  if (preservedNameLength <= 0) {
    const extensionBody = extension.slice(1)
    const extensionBudget = maxLength - ELLIPSIS_LENGTH

    if (extensionBudget === 1) {
      return `${ELLIPSIS}.`
    }

    const visibleExtensionBodyLength = Math.max(1, extensionBudget - 1)
    return `${ELLIPSIS}.${extensionBody.slice(-visibleExtensionBodyLength)}`
  }

  if (nameWithoutExtension.length <= preservedNameLength) {
    return `${nameWithoutExtension}${extension}`
  }

  let suffixLength = Math.max(1, Math.floor(preservedNameLength * 0.4))
  let prefixLength = preservedNameLength - suffixLength

  let prefix = nameWithoutExtension.slice(0, prefixLength)
  let suffix = nameWithoutExtension.slice(-suffixLength)

  // If the suffix starts with a separator, shift one character from prefix to suffix
  // for a more natural tail (e.g. "...r_speed" instead of "..._speed").
  if (/^[-_.]/.test(suffix) && prefixLength > 1) {
    suffixLength += 1
    prefixLength -= 1
    prefix = nameWithoutExtension.slice(0, prefixLength)
    suffix = nameWithoutExtension.slice(-suffixLength)
  }

  return `${prefix}${ELLIPSIS}${suffix}${extension}`
}
