import React, { useContext, useEffect } from 'react'
import { Button, Dialog, Flex, TextArea, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { ChatContext, Persona } from '@/components'

const PersonaModal = () => {
  const {
    isOpenPersonaModal: open,
    editPersona: detail,
    onCreatePersona,
    onClosePersonaModal
  } = useContext(ChatContext)

  const { register, handleSubmit, setValue } = useForm()

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
        <Dialog.Title>Create or Edit Persona Prompt</Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <form onSubmit={formSubmit}>
          <Flex direction="column" gap="3">
            <TextField.Root placeholder="Name" {...register('name', { required: true })} />
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
