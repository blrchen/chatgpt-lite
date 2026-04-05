export function generateId(): string {
  return globalThis.crypto.randomUUID()
}
