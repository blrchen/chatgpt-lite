import { type RefCallback, type RefObject } from 'react'
import { AppButton, AppIconButton } from '@/components/common/app-button'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import { ATTACHMENTS_ACCEPT } from '@/lib/chat-attachments'
import { cn } from '@/lib/utils'
import { ArrowUp, Mic, MicOff, Paperclip, Square, Trash2 } from 'lucide-react'

interface ComposerToolbarProps {
  canInteract: boolean
  isSending: boolean
  canSend: boolean
  showClear: boolean
  isListening: boolean
  isVoiceButtonInView: boolean
  voiceButtonRef: RefCallback<HTMLButtonElement>
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  onVoiceToggle: () => void
  onSend: (e: React.SyntheticEvent) => void
  onStop: () => void
}

export function ComposerToolbar({
  canInteract,
  isSending,
  canSend,
  showClear,
  isListening,
  isVoiceButtonInView,
  voiceButtonRef,
  fileInputRef,
  onFileUpload,
  onClear,
  onVoiceToggle,
  onSend,
  onStop
}: ComposerToolbarProps) {
  return (
    <div className="flex items-center justify-between px-3 pb-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          name="attachments"
          accept={ATTACHMENTS_ACCEPT}
          multiple
          className="hidden"
          aria-label="Attach file"
          onChange={onFileUpload}
        />
        <ButtonWithTooltip label="Attach file">
          <AppIconButton
            size="icon-sm"
            variant="ghost"
            disabled={!canInteract}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
            className="text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full transition-colors duration-200"
          >
            <Paperclip aria-hidden="true" />
          </AppIconButton>
        </ButtonWithTooltip>
        {showClear && (
          <ButtonWithTooltip label="Clear conversation history">
            <AppButton
              size="sm"
              variant="outline"
              className="hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive disabled:border-border/40 rounded-lg shadow-none transition-colors duration-200 md:h-7"
              disabled={isSending}
              onClick={onClear}
            >
              <Trash2 data-icon="inline-start" aria-hidden="true" />
              <span className="text-xs font-medium">Clear history</span>
            </AppButton>
          </ButtonWithTooltip>
        )}
      </div>
      {isSending ? (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <span className="sr-only">Generating response</span>
          <ButtonWithTooltip label="Stop generating">
            <AppIconButton
              type="button"
              size="icon-sm"
              onClick={onStop}
              aria-label="Stop generating"
              className="bg-accent text-accent-foreground hover:bg-accent/90 relative overflow-hidden rounded-full transition-colors duration-200 hover:shadow-lg"
            >
              <Square fill="currentColor" stroke="none" aria-hidden="true" />
            </AppIconButton>
          </ButtonWithTooltip>
        </div>
      ) : (
        <div className="flex gap-2">
          <ButtonWithTooltip label={isListening ? 'Stop voice input' : 'Start voice input'}>
            <AppIconButton
              ref={voiceButtonRef}
              size="icon-sm"
              variant="ghost"
              disabled={!canInteract}
              onClick={onVoiceToggle}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              className={cn(
                'rounded-full',
                isListening
                  ? 'text-destructive relative'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors duration-200'
              )}
            >
              {isListening && isVoiceButtonInView && (
                <>
                  <span className="bg-destructive/25 absolute inset-0 animate-[voice-ring_1.5s_ease-out_infinite] rounded-full motion-reduce:animate-none" />
                  <span className="bg-destructive/15 absolute inset-0 animate-[voice-ring_1.5s_ease-out_0.4s_infinite] rounded-full motion-reduce:animate-none" />
                </>
              )}
              {isListening ? (
                <MicOff className="relative size-4" aria-hidden="true" />
              ) : (
                <Mic className="size-4" aria-hidden="true" />
              )}
            </AppIconButton>
          </ButtonWithTooltip>
          <ButtonWithTooltip label="Send message">
            <AppIconButton
              size="icon-sm"
              disabled={!canSend}
              className="bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden rounded-full transition-colors duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-none"
              onClick={onSend}
              aria-label="Send message"
            >
              <ArrowUp aria-hidden="true" />
            </AppIconButton>
          </ButtonWithTooltip>
        </div>
      )}
    </div>
  )
}
