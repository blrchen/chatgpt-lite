export type ErrorCode =
  // Server-side (API routes)
  | 'invalid_json'
  | 'invalid_request'
  | 'invalid_file'
  | 'file_too_large'
  | 'parse_error'
  | 'internal_error'
  // Client-side (storage / hydration)
  | 'storage_error'
  | 'corrupt_data'

export type ErrorSurface = 'api' | 'cache' | 'store' | 'stream'

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  invalid_json: 400,
  invalid_request: 400,
  invalid_file: 400,
  file_too_large: 413,
  parse_error: 500,
  internal_error: 500,
  storage_error: 500,
  corrupt_data: 500
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly surface?: ErrorSurface

  constructor(code: ErrorCode, message: string, surface?: ErrorSurface) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = STATUS_BY_CODE[code]
    this.surface = surface
  }

  toResponse(): Response {
    return Response.json({ code: this.code, message: this.message }, { status: this.statusCode })
  }

  static from(code: ErrorCode, error: unknown, fallbackMessage: string): AppError {
    const message = error instanceof Error ? error.message : fallbackMessage
    return new AppError(code, message)
  }

  /** Log a non-fatal error with structured context. Does not throw. */
  static warn(surface: ErrorSurface, code: ErrorCode, message: string, cause?: unknown): void {
    if (cause !== undefined) {
      console.warn(`[${surface}:${code}] ${message}`, cause)
    } else {
      console.warn(`[${surface}:${code}] ${message}`)
    }
  }
}
