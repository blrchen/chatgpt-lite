export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = { [key: string]: JsonValue }

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function readJsonString(record: JsonObject, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}
