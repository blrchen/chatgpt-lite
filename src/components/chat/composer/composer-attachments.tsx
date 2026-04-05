import { memo, useState } from 'react'
import Image from 'next/image'
import { AppIconButton } from '@/components/common/app-button'
import { ImagePreviewDialog } from '@/components/common/image-preview-dialog'
import { type UploadedDocument, type UploadedImage } from '@/lib/chat-attachments'
import { cn, truncateFilenameMiddle } from '@/lib/utils'
import { FileText, X } from 'lucide-react'

interface ComposerAttachmentsProps {
  uploadedImages: UploadedImage[]
  uploadedDocuments: UploadedDocument[]
  onRemoveImage: (id: string) => void
  onRemoveDocument: (id: string) => void
  onImagePreviewError: (imageId: string, url: string) => void
}

type RemoveAttachmentButtonProps = {
  className: string
  label: string
  onClick: () => void
}

type SplitFilenameResult = {
  baseName: string
  extension: string
}

const DOCUMENT_FILENAME_MAX_LENGTH = 18
const DOCUMENT_FILENAME_MIN_BASE_LENGTH = 6

function splitFilename(name: string): SplitFilenameResult {
  const dotIndex = name.lastIndexOf('.')
  const hasExtension = dotIndex > 0 && dotIndex < name.length - 1

  if (!hasExtension) {
    return { baseName: name, extension: '' }
  }

  return {
    baseName: name.slice(0, dotIndex),
    extension: name.slice(dotIndex)
  }
}

function getVisibleDocumentFilename(name: string): SplitFilenameResult {
  const { baseName, extension } = splitFilename(name)
  if (!extension) {
    return {
      baseName: truncateFilenameMiddle(baseName, DOCUMENT_FILENAME_MAX_LENGTH),
      extension: ''
    }
  }

  const availableBaseLength = Math.max(
    DOCUMENT_FILENAME_MIN_BASE_LENGTH,
    DOCUMENT_FILENAME_MAX_LENGTH - extension.length
  )

  return {
    baseName: truncateFilenameMiddle(baseName, availableBaseLength),
    extension
  }
}

function RemoveAttachmentButton({
  className,
  label,
  onClick
}: RemoveAttachmentButtonProps): React.JSX.Element {
  return (
    <AppIconButton
      type="button"
      variant="ghost"
      size="icon-sm"
      touch={false}
      mutedDisabled={false}
      onClick={onClick}
      className={cn(
        'bg-destructive/90 text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-sm',
        className
      )}
      aria-label={label}
    >
      <X aria-hidden="true" />
    </AppIconButton>
  )
}

export const ComposerAttachments = memo(function ComposerAttachments({
  uploadedImages,
  uploadedDocuments,
  onRemoveImage,
  onRemoveDocument,
  onImagePreviewError
}: ComposerAttachmentsProps): React.JSX.Element {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)

  return (
    <>
      <div className="flex flex-wrap gap-2 px-4 pt-3">
        {uploadedImages.map((img) => (
          <div key={img.id} className="group relative size-20">
            <button
              type="button"
              className="focus-visible:ring-ring/60 focus-visible:ring-offset-background relative block size-full rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="Open image preview"
              onClick={() => setPreviewImage({ src: img.url, alt: img.name || 'Upload preview' })}
            >
              <Image
                src={img.url}
                alt={img.name || 'Upload preview'}
                fill
                unoptimized
                sizes="80px"
                className="border-border/50 rounded-xl border object-cover shadow-sm transition-opacity group-hover:opacity-95"
                onError={() => onImagePreviewError(img.id, img.url)}
              />
            </button>
            <RemoveAttachmentButton
              onClick={() => onRemoveImage(img.id)}
              className="absolute -top-1.5 -right-1.5 size-11 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              label="Remove image"
            />
          </div>
        ))}
        {uploadedDocuments.map((doc) => {
          const visibleName = getVisibleDocumentFilename(doc.name)

          return (
            <div
              key={doc.id}
              className="group border-border/50 bg-muted/50 relative flex items-center gap-2 rounded-xl border py-2 pr-12 pl-3 shadow-sm hover:shadow-md"
            >
              <span className="bg-accent text-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                <FileText className="size-3.5" aria-hidden="true" />
              </span>
              <span className="max-w-36 min-w-0 text-sm font-medium" title={doc.name}>
                <span className="inline-flex max-w-full min-w-0 items-center">
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {visibleName.baseName}
                  </span>
                  {visibleName.extension ? (
                    <span className="shrink-0 whitespace-nowrap">{visibleName.extension}</span>
                  ) : null}
                </span>
              </span>
              <RemoveAttachmentButton
                onClick={() => onRemoveDocument(doc.id)}
                className="absolute top-1/2 right-1 size-11 -translate-y-1/2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                label="Remove document"
              />
            </div>
          )
        })}
      </div>
      {previewImage && (
        <ImagePreviewDialog
          open
          onOpenChange={() => setPreviewImage(null)}
          src={previewImage.src}
          alt={previewImage.alt}
        />
      )}
    </>
  )
})
