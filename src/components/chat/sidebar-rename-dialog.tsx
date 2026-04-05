import { useEffect, useRef } from 'react'
import { AppButton } from '@/components/common/app-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isMobileViewport } from '@/lib/viewport'

type SidebarRenameDialogProps = {
  open: boolean
  renameValue: string
  trimmedRenameValue: string
  onRenameValueChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function SidebarRenameDialog({
  open,
  renameValue,
  trimmedRenameValue,
  onRenameValueChange,
  onCancel,
  onConfirm
}: SidebarRenameDialogProps): React.JSX.Element {
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !renameInputRef.current || isMobileViewport()) {
      return
    }

    renameInputRef.current.focus()
    renameInputRef.current.select()
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel()
        }
      }}
    >
      <DialogContent className="overscroll-behavior-contain sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-balance">Rename chat</DialogTitle>
          <DialogDescription className="text-pretty">
            Choose a clearer title for this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="chat-rename-title">Title</Label>
          <Input
            id="chat-rename-title"
            name="chat-title"
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(event) => onRenameValueChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (trimmedRenameValue) {
                  onConfirm()
                }
              }
            }}
            autoComplete="off"
            aria-label="Chat title"
            className="bg-background focus-visible:ring-offset-background focus-visible:ring-offset-2"
          />
        </div>
        <DialogFooter>
          <AppButton type="button" variant="outline" onClick={onCancel}>
            Cancel
          </AppButton>
          <AppButton type="button" onClick={onConfirm} disabled={!trimmedRenameValue}>
            Save
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
