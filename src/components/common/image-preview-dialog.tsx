import { AppIconButton } from '@/components/common/app-button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

type ImagePreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  alt
}: ImagePreviewDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-fit max-w-[min(96vw,1100px)] gap-0 border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{alt || 'Image preview'}</DialogTitle>
        <DialogDescription className="sr-only">
          Enlarged preview of the selected image
        </DialogDescription>

        <div className="relative max-h-[90dvh] max-w-[min(96vw,1100px)]">
          {/* Remote and data URLs are user-provided payloads; native image keeps behavior predictable. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="h-auto max-h-[90dvh] w-auto max-w-[min(96vw,1100px)] rounded-lg object-contain shadow-2xl"
          />
        </div>

        <DialogClose asChild>
          <AppIconButton
            type="button"
            variant="ghost"
            size="icon-lg"
            touch={false}
            mutedDisabled={false}
            className="text-foreground bg-background/90 hover:bg-background absolute top-3 right-3 rounded-full sm:top-5 sm:right-5"
            aria-label="Close image preview"
          >
            <X aria-hidden="true" />
          </AppIconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
