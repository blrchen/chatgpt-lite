'use client'

import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { Input, Textarea } from '@material-tailwind/react'
import { useForm } from 'react-hook-form'

export interface NormalFormProps {
  detail?: Persona
  onSubmit: (values: any) => void
}

const NormalForm = (props: NormalFormProps, ref: any) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  const { detail, onSubmit } = props

  const formSubmit = handleSubmit((values: any) => {
    onSubmit({ ...values, type: 'normal' })
  })

  useImperativeHandle<any, any>(ref, () => {
    return {
      submit: formSubmit
    }
  })

  useEffect(() => {
    if (detail) {
      setValue('name', detail.name, { shouldTouch: true })
      setValue('prompt', detail.prompt, { shouldTouch: true })
    }
  }, [detail])

  return (
    <form onSubmit={formSubmit}>
      <div className="mb-2 flex flex-col gap-6">
        <Input
          label="Name"
          maxLength={19}
          {...register('name', { required: true })}
          error={errors.name && true}
        />
        <Textarea label="Prompt" {...register('prompt')} />
      </div>
    </form>
  )
}

export default forwardRef<any, NormalFormProps>(NormalForm)
