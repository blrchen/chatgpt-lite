'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppButton } from '@/components/common/app-button'
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { selectGetPersonaById, selectSavePersona, usePersonaStore } from '@/store/persona-store'
import {
  selectClosePersonaModal,
  selectEditPersonaId,
  usePersonaUiStore
} from '@/store/persona-ui-store'
import { useForm } from 'react-hook-form'

type PersonaFormValues = {
  name: string
  prompt: string
}

const EMPTY_FORM_VALUES: PersonaFormValues = { name: '', prompt: '' }

export default function PersonaModal(): React.JSX.Element {
  const editPersonaId = usePersonaUiStore(selectEditPersonaId)
  const getPersonaById = usePersonaStore(selectGetPersonaById)
  const editingPersona = editPersonaId ? getPersonaById(editPersonaId) : undefined
  const savePersona = usePersonaStore(selectSavePersona)
  const closePersonaModal = usePersonaUiStore(selectClosePersonaModal)

  const formValues = useMemo(
    () =>
      editingPersona
        ? { name: editingPersona.name ?? '', prompt: editingPersona.prompt }
        : EMPTY_FORM_VALUES,
    [editingPersona]
  )

  const form = useForm<PersonaFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
    values: formValues
  })
  const isDirty = form.formState.isDirty
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)

  useEffect(() => {
    if (!isDirty) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  const onSubmit = useCallback(
    ({ name, prompt }: PersonaFormValues): void => {
      savePersona({
        id: editingPersona?.id,
        name,
        prompt
      })
      closePersonaModal()
    },
    [closePersonaModal, editingPersona?.id, savePersona]
  )

  const handleRequestClose = useCallback((): void => {
    if (isDirty) {
      setIsDiscardDialogOpen(true)
      return
    }

    closePersonaModal()
  }, [closePersonaModal, isDirty])

  const handleDiscardChanges = useCallback((): void => {
    closePersonaModal()
    setIsDiscardDialogOpen(false)
  }, [closePersonaModal])

  const handleOpenChange = useCallback(
    (nextOpen: boolean): void => {
      if (!nextOpen) {
        handleRequestClose()
      }
    },
    [handleRequestClose]
  )

  return (
    <>
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="bg-background overscroll-behavior-contain w-full max-w-3xl rounded-2xl p-4 shadow-xl md:max-w-4xl md:p-8">
          <DialogHeader className="text-left">
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-display text-xl font-medium tracking-tight text-balance md:text-2xl">
                {editingPersona ? 'Edit Persona' : 'Create Persona'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm text-pretty">
                {editingPersona
                  ? 'Modify your custom AI personality'
                  : 'Define a new AI personality for your conversations'}
              </DialogDescription>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="e.g. Research Partner…"
                        autoComplete="off"
                        className="placeholder:text-muted-foreground"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="e.g. You are a concise research partner who cites sources…"
                        rows={12}
                        autoComplete="off"
                        className="placeholder:text-muted-foreground min-h-56 md:min-h-80"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-8 gap-3">
                <AppButton
                  variant="outline"
                  type="button"
                  onClick={handleRequestClose}
                  className="hover:bg-muted/50 min-w-24 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="default"
                  type="submit"
                  className="min-w-24 rounded-xl hover:shadow-md"
                >
                  Save Persona
                </AppButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ConfirmActionDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
        title="Discard unsaved persona changes?"
        description="Your edits will be lost and cannot be recovered."
        confirmLabel="Discard changes"
        confirmVariant="destructive"
        onConfirm={handleDiscardChanges}
      />
    </>
  )
}
