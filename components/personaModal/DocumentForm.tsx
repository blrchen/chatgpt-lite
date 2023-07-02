'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineCloudUpload, AiOutlineDelete } from 'react-icons/ai'
import { useDropzone } from 'react-dropzone'
import cs from 'clsx'
import {
  Input,
  List,
  ListItem,
  ListItemSuffix,
  IconButton,
  Typography
} from '@material-tailwind/react'

export interface DocumentFormProps {
  onSubmit: (values: any) => void
}

const DocumentForm = (props: DocumentFormProps, ref: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const { onSubmit } = props

  const [dragEnter, setDragEnter] = useState(false)

  const [files, setFiles] = useState<File[]>([])

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    onDragEnter() {
      console.log('dragEnter')
      setDragEnter(true)
    },
    onDragLeave() {
      setDragEnter(false)
    },
    onDrop(acceptedFiles) {
      setFiles(acceptedFiles)
      setDragEnter(false)
    }
  })

  const formSubmit = handleSubmit((values: any) => {
    onSubmit({ ...values, type: 'document', files })
  })

  const handleRemoveFile = (index: number) => {
    setFiles((files) => {
      files.splice(index, 1)
      return [...files]
    })
  }

  useImperativeHandle<any, any>(ref, () => {
    return {
      submit: formSubmit
    }
  })

  return (
    <form onSubmit={formSubmit} className="flex flex-col gap-6">
      <Input
        label="Name"
        maxLength={19}
        {...register('name', { required: true })}
        error={errors.name && true}
      />
      <div
        {...getRootProps({
          className: 'flex items-center justify-center w-full'
        })}
      >
        <div
          className={cs(
            `flex flex-col items-center justify-center w-full h-56 border text-center
          border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100 text-blue-gray-700`,
            dragEnter ? 'border-blue-300' : 'border-blue-gray-200'
          )}
        >
          <AiOutlineCloudUpload className="h-14 w-14" />
          <Typography variant="lead" className="mb-3">
            Click or drag file to this area to upload
          </Typography>
          <Typography variant="paragraph">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or
            other band files
          </Typography>
          <input {...getInputProps()} />
        </div>
      </div>
      <List className="p-0">
        {files.map((file, index) => (
          <ListItem selected key={index} ripple={false} className="py-1 pr-1 pl-4">
            {file.name}
            <ListItemSuffix>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => {
                  handleRemoveFile(index)
                }}
              >
                <AiOutlineDelete className="h-4 w-4" />
              </IconButton>
            </ListItemSuffix>
          </ListItem>
        ))}
      </List>
    </form>
  )
}

export default forwardRef<any, DocumentFormProps>(DocumentForm)
