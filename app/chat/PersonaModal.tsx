import React, { useContext, useEffect } from 'react'
import { Button, Dialog, Flex, TextArea, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import ChatContext from '@/components/Chat/chatContext'
import type { Persona } from '@/components/Chat/interface'

const PersonaModal = () => {
  const {
    isOpenPersonaModal: open,
    editPersona: detail,
    onCreateOrUpdatePersona,
    onClosePersonaModal
  } = useContext(ChatContext)

  const { register, handleSubmit, setValue, reset } = useForm<{
    name: string
    prompt: string
    role: string
  }>()

  useEffect(() => {
    if (open && detail) {
      setValue('name', detail.name ?? '')
      setValue('prompt', detail.prompt ?? '')
    } else if (open && !detail) {
      reset({ name: '', prompt: '' })
    }
    if (!open) {
      reset({ name: '', prompt: '' })
    }
  }, [open, detail, setValue, reset])

  const formSubmit = handleSubmit(({ name, prompt }) => {
    const persona: Persona = { name, prompt, role: 'assistant' }
    onCreateOrUpdatePersona?.(persona)
  })

  return (
    <Dialog.Root open={!!open}>
      <Dialog.Content size="4">
        <Dialog.Title>{detail ? 'Edit Persona Prompt' : 'Create Persona Prompt'}</Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <form onSubmit={formSubmit}>
          <Flex direction="column" gap="3">
            <TextField.Root
              placeholder="Name"
              {...register('name', { required: true })}
              autoComplete="off"
            />
            <TextArea
              placeholder="Prompt"
              rows={7}
              {...register('prompt', { required: true })}
              autoComplete="off"
            />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" type="button" color="gray" onClick={onClosePersonaModal}>
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant="soft" type="submit">
                Save
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default PersonaModal
