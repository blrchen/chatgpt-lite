import { type RefObject } from 'react'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const TEXTAREA_CLASS_NAME =
  'text-foreground w-full min-w-0 resize-none rounded-none border-0 bg-transparent text-base leading-relaxed break-words outline-none shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-52 min-h-6 overflow-y-auto [field-sizing:content] md:text-base'

interface ComposerTextareaProps {
  textAreaRef: RefObject<HTMLTextAreaElement | null>
  message: string
  disabled: boolean
  showPlaceholder: boolean
  interimTranscript: string
  isVoiceButtonInView: boolean
  composerError: string | null
  chatInputId: string
  helperTextId: string
  errorTextId: string
  onMessageChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onCompositionStart: () => void
  onCompositionEnd: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
}

export function ComposerTextarea({
  textAreaRef,
  message,
  disabled,
  showPlaceholder,
  interimTranscript,
  isVoiceButtonInView,
  composerError,
  chatInputId,
  helperTextId,
  errorTextId,
  onMessageChange,
  onFocus,
  onBlur,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  onPaste
}: ComposerTextareaProps): React.JSX.Element {
  return (
    <div className="relative flex min-h-11 min-w-0 flex-1 items-start px-4 pt-2 pb-1">
      <FieldGroup className="min-w-0 flex-1 gap-0">
        <Field data-invalid={composerError ? true : undefined} className="min-w-0 gap-0">
          <FieldLabel className="sr-only" htmlFor={chatInputId}>
            Message input
          </FieldLabel>
          <FieldDescription id={helperTextId} className="sr-only">
            Press Enter to send your message. Use Shift plus Enter to insert a new line.
          </FieldDescription>
          <Textarea
            ref={textAreaRef}
            rows={1}
            data-composer-textarea="true"
            className={cn(
              TEXTAREA_CLASS_NAME,
              interimTranscript && 'text-transparent caret-transparent'
            )}
            value={message}
            disabled={disabled}
            id={chatInputId}
            name="message"
            autoComplete="off"
            enterKeyHint="send"
            aria-invalid={!!composerError}
            aria-describedby={composerError ? `${helperTextId} ${errorTextId}` : helperTextId}
            onFocus={onFocus}
            onBlur={onBlur}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onMessageChange(e.target.value)
            }
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
        </Field>
      </FieldGroup>
      {showPlaceholder && !interimTranscript && (
        <span className="text-muted-foreground pointer-events-none absolute top-2 left-4 max-w-[calc(100%-2rem)] truncate text-base leading-relaxed">
          Ask anything
        </span>
      )}
      {interimTranscript ? (
        <span className="text-foreground pointer-events-none absolute top-2 left-4 text-base leading-relaxed">
          {message}
          <span
            className={cn('motion-reduce:animate-none', isVoiceButtonInView && 'animate-pulse')}
          >
            {interimTranscript}
          </span>
        </span>
      ) : null}
    </div>
  )
}
