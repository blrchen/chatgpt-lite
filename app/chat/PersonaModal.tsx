import React, { useContext, useEffect } from 'react'

import { Button, Dialog, Flex, TextField, TextArea } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'

import { ChatContext, Persona } from '@/components'

const PersonaModal = () => {
  const {
    isOpenPersonaModal: open,
    personaModalLoading: isLoading,
    editPersona: detail,
    onCreatePersona,
    onClosePersonaModal
  } = useContext(ChatContext)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  const formSubmit = handleSubmit((values: any) => {
    onCreatePersona?.(values as Persona)
  })

  useEffect(() => {
    if (detail) {
      setValue('name', detail.name, { shouldTouch: true })
      setValue('prompt', detail.prompt, { shouldTouch: true })
    }
  }, [detail, setValue])

  return (
    <Dialog.Root open={open!}>
      <Dialog.Content size="4">
        <Dialog.Title>Prompt</Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <form onSubmit={formSubmit}>
          <Flex direction="column" gap="3">
            <TextField.Input placeholder="Name" {...register('name', { required: true })} />

            <TextArea placeholder="Prompt" rows={7} {...register('prompt', { required: true })} />
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" type="button" color="gray" onClick={onClosePersonaModal}>
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant="soft" type="submit">
                OK
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default PersonaModal
