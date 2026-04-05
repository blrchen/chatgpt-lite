export function formatSizeInMB(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  const rounded = Number.isInteger(mb) ? String(mb) : mb.toFixed(2)
  return `${rounded}MB`
}
