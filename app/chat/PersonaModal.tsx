import React, { useContext, useEffect } from 'react'
import { Button, Dialog, Flex, TextArea, TextField, Select } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { ChatContext, Persona } from '@/components'
import Spinner from '@/components/spinner/spinner'

const PersonaModal = () => {
  const {
    isOpenPersonaModal: open,
    editPersona: detail,
    onCreatePersona,
    onClosePersonaModal,
    onSubmitEditPersona,
    loading
  } = useContext(ChatContext)

  const { register, handleSubmit, setValue, watch } = useForm()

  const formSubmit = handleSubmit(async (values: any) => {
    if (detail?.id) {
      onSubmitEditPersona?.(values as Persona)
    } else {
      onCreatePersona?.(values as Persona)
    }
  })

  useEffect(() => {
    if (detail) {
      setValue('name', detail.name, { shouldTouch: true })
      setValue('prompt', detail.prompt, { shouldTouch: true })
      setValue('brand', detail.brand, { shouldTouch: true })
      setValue('id', detail.id, { shouldTouch: true })
    }
    if (!detail) {
      setValue('name', '', { shouldTouch: true })
      setValue('prompt', '', { shouldTouch: true })
      setValue('brand', '', { shouldTouch: true })
      setValue('id', '', { shouldTouch: true })
    }
  }, [detail, setValue])

  const selectedBrand = watch('brand')

  useEffect(() => {
    setValue('brand', selectedBrand)

    // Update the value of 'brand' in the form
  }, [selectedBrand, setValue])

  const allBrands = [
    { value: 'happySenior', label: 'Happy Senior' },
    { value: 'odalysVacances', label: 'Odalys Vacances' },
    { value: 'sgit', label: 'SGIT' },
    { value: 'odalysCity', label: 'Odalys City' },
    { value: 'odalysCampus', label: 'Odalys Campus' },
    { value: 'flowerCampings', label: 'Flower Campings' },
    { value: 'sgitGestion', label: 'SGIT Gestion' },
    { value: 'odalysInvest', label: 'Odalys Invest' },
    { value: 'odalysPleinAir', label: 'Odalys Plein Air' },
    { value: 'laConciergerieByOdalys', label: 'La Conciergerie by Odalys' },
    { value: 'odalysEvenementsEtGroupes', label: 'Odalys Événements et Groupes' },
    { value: 'odalysGroupe', label: 'Odalys Groupe' }
  ]

  return (
    <Dialog.Root open={open!}>
      <Dialog.Content size="4">
        <Dialog.Title>Create or Edit Persona Prompt</Dialog.Title>
        <Dialog.Description size="2" mb="4"></Dialog.Description>
        <form onSubmit={formSubmit}>
          <Flex direction="column" gap="3">
            <TextField.Input placeholder="Name" {...register('name', { required: true })} />

            <Select.Root value={selectedBrand} onValueChange={(value) => setValue('brand', value)}>
              <Select.Trigger placeholder="Sélectionnez une marque" />
              <Select.Content>
                {allBrands.map((brand) => (
                  <Select.Item key={brand.value} value={brand.value}>
                    {brand.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <TextArea placeholder="Prompt" rows={7} {...register('prompt', { required: true })} />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" type="button" color="gray" onClick={onClosePersonaModal}>
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant="soft" type="submit" disabled={loading}>
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
