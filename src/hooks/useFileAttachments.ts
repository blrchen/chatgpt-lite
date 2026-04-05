import { useCallback, useRef, useState, type SetStateAction } from 'react'
import { MAX_IMAGE_SIZE } from '@/lib/chat-attachment-shared'
import {
  convertImageToSupportedFormat,
  createUploadedDocument,
  createUploadedImage,
  getImageMimeType,
  isDocumentFile,
  isImageFile,
  readFileAsDataUrl,
  type UploadedDocument,
  type UploadedImage
} from '@/lib/chat-attachments'
import { formatSizeInMB } from '@/lib/size'
import { toast } from 'sonner'

const MAX_IMAGE_SIZE_LABEL = formatSizeInMB(MAX_IMAGE_SIZE)

interface UseFileAttachmentsReturn {
  uploadedImages: UploadedImage[]
  uploadedDocuments: UploadedDocument[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  handleImagePreviewError: (imageId: string, url: string) => void
  removeImage: (id: string) => void
  removeDocument: (id: string) => void
  resetAttachments: () => void
  restoreAttachments: (images: UploadedImage[], documents: UploadedDocument[]) => void
  hasAttachments: boolean
  hasCurrentAttachments: () => boolean
}

type QueuedImageConversions = Array<Promise<UploadedImage | null>>

type UploadClassification = {
  documentFiles: File[]
  imageConversions: QueuedImageConversions
}

export function useFileAttachments(): UseFileAttachmentsReturn {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const failedPreviewIdsRef = useRef<Set<string>>(new Set())
  const uploadedImagesRef = useRef<UploadedImage[]>([])
  const uploadedDocumentsRef = useRef<UploadedDocument[]>([])

  const updateUploadedImages = useCallback((nextState: SetStateAction<UploadedImage[]>) => {
    setUploadedImages((currentImages) => {
      const nextImages = typeof nextState === 'function' ? nextState(currentImages) : nextState

      uploadedImagesRef.current = nextImages

      const currentImageIds = new Set(nextImages.map(({ id }) => id))
      for (const id of failedPreviewIdsRef.current) {
        if (!currentImageIds.has(id)) {
          failedPreviewIdsRef.current.delete(id)
        }
      }

      return nextImages
    })
  }, [])

  const updateUploadedDocuments = useCallback((nextState: SetStateAction<UploadedDocument[]>) => {
    setUploadedDocuments((currentDocuments) => {
      const nextDocuments =
        typeof nextState === 'function' ? nextState(currentDocuments) : nextState
      uploadedDocumentsRef.current = nextDocuments
      return nextDocuments
    })
  }, [])

  const convertImageFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const converted = await convertImageToSupportedFormat(dataUrl, getImageMimeType(file))
      return createUploadedImage({
        url: converted.url,
        mimeType: converted.mimeType,
        name: file.name || undefined
      })
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error(
        file.name
          ? `Unsupported image format: ${file.name}. Supported: JPEG, PNG, GIF, WebP`
          : 'Unsupported image format. Supported: JPEG, PNG, GIF, WebP'
      )
      return null
    }
  }, [])

  const addConvertedImages = useCallback(
    async (conversions: Array<Promise<UploadedImage | null>>) => {
      if (conversions.length === 0) {
        return
      }

      const results = await Promise.all(conversions)
      const successful = results.filter((image): image is UploadedImage => image !== null)
      if (successful.length > 0) {
        updateUploadedImages((prev) => [...prev, ...successful])
      }
    },
    [updateUploadedImages]
  )

  const queueImageConversion = useCallback(
    (file: File, conversions: QueuedImageConversions, source: 'upload' | 'paste') => {
      if (file.size > MAX_IMAGE_SIZE) {
        if (source === 'upload') {
          toast.error(`Image too large: ${file.name}. Maximum size is ${MAX_IMAGE_SIZE_LABEL}.`)
        } else {
          toast.error(`Image too large to paste. Maximum size is ${MAX_IMAGE_SIZE_LABEL}.`)
        }
        return
      }

      conversions.push(convertImageFile(file))
    },
    [convertImageFile]
  )

  const classifyUploadedFiles = useCallback(
    (files: FileList): UploadClassification => {
      const documentFiles: File[] = []
      const imageConversions: QueuedImageConversions = []

      for (const file of Array.from(files)) {
        if (isImageFile(file)) {
          queueImageConversion(file, imageConversions, 'upload')
          continue
        }

        if (isDocumentFile(file)) {
          documentFiles.push(file)
          continue
        }

        toast.error(`Unsupported file type: ${file.name}`)
      }

      return { documentFiles, imageConversions }
    },
    [queueImageConversion]
  )

  const parseUploadedDocuments = useCallback(
    async (documentFiles: File[]): Promise<UploadedDocument[]> => {
      if (documentFiles.length === 0) {
        return []
      }

      try {
        const { parseFile } = await import('@/lib/file-parser')
        const results = await Promise.allSettled(documentFiles.map((file) => parseFile(file)))
        const parsedDocuments: UploadedDocument[] = []

        for (const [index, result] of results.entries()) {
          const file = documentFiles[index]
          if (!file) {
            continue
          }

          if (result.status === 'fulfilled') {
            parsedDocuments.push(createUploadedDocument(result.value))
            toast.success(`File "${file.name}" uploaded successfully`)
            continue
          }

          console.error('Error parsing file:', result.reason)
          toast.error(`Failed to parse file: ${file.name}`)
        }

        return parsedDocuments
      } catch (error) {
        console.error('Error loading file parser:', error)
        for (const file of documentFiles) {
          toast.error(`Failed to parse file: ${file.name}`)
        }
        return []
      }
    },
    []
  )

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const { documentFiles, imageConversions } = classifyUploadedFiles(files)
      const parseDocumentsTask = parseUploadedDocuments(documentFiles)

      await addConvertedImages(imageConversions)

      const parsedDocuments = await parseDocumentsTask
      if (parsedDocuments.length > 0) {
        updateUploadedDocuments((prev) => [...prev, ...parsedDocuments])
      }

      const fileInput = fileInputRef.current
      if (fileInput) {
        fileInput.value = ''
      }
    },
    [addConvertedImages, classifyUploadedFiles, parseUploadedDocuments, updateUploadedDocuments]
  )

  const removeImage = useCallback(
    (id: string) => {
      updateUploadedImages((prev) => prev.filter((image) => image.id !== id))
    },
    [updateUploadedImages]
  )

  const removeDocument = useCallback(
    (id: string) => {
      updateUploadedDocuments((prev) => prev.filter((document) => document.id !== id))
    },
    [updateUploadedDocuments]
  )

  const handleImagePreviewError = useCallback(
    (id: string, url: string) => {
      const currentImage = uploadedImagesRef.current.find((image) => image.id === id)
      if (!currentImage || currentImage.url !== url || failedPreviewIdsRef.current.has(id)) {
        return
      }

      failedPreviewIdsRef.current.add(id)
      updateUploadedImages((prev) => {
        const imageToRemove = prev.find((image) => image.id === id)
        if (!imageToRemove || imageToRemove.url !== url) {
          return prev
        }

        return prev.filter((image) => image.id !== id)
      })
      toast.error('Failed to load the image preview. Try uploading it again.')
    },
    [updateUploadedImages]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items
      if (!items) return

      const pastedImageConversions: Array<Promise<UploadedImage | null>> = []
      let hasPastedImage = false
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item?.type?.startsWith('image/')) continue

        const file = item.getAsFile()
        if (!file) continue

        hasPastedImage = true
        queueImageConversion(file, pastedImageConversions, 'paste')
      }

      if (!hasPastedImage) {
        return
      }

      // Prevent browsers from inserting plain-text clipboard artifacts into the textarea
      // when image paste is handled as an attachment.
      event.preventDefault()
      void addConvertedImages(pastedImageConversions)
    },
    [addConvertedImages, queueImageConversion]
  )

  const resetAttachments = useCallback(() => {
    updateUploadedImages([])
    updateUploadedDocuments([])
  }, [updateUploadedDocuments, updateUploadedImages])

  const restoreAttachments = useCallback(
    (images: UploadedImage[], documents: UploadedDocument[]) => {
      updateUploadedImages(images)
      updateUploadedDocuments(documents)
    },
    [updateUploadedDocuments, updateUploadedImages]
  )

  const hasAttachments = uploadedImages.length > 0 || uploadedDocuments.length > 0

  const hasCurrentAttachments = useCallback(
    () => uploadedImagesRef.current.length > 0 || uploadedDocumentsRef.current.length > 0,
    []
  )

  return {
    uploadedImages,
    uploadedDocuments,
    fileInputRef,
    handleFileUpload,
    handlePaste,
    handleImagePreviewError,
    removeImage,
    removeDocument,
    resetAttachments,
    restoreAttachments,
    hasAttachments,
    hasCurrentAttachments
  }
}
