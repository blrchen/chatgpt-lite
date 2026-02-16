'use client'

import { useCallback, useEffect } from 'react'
import { usePersonaContext } from '@/components/chat/personaContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'

type PersonaFormValues = {
  name: string
  prompt: string
}

const EMPTY_FORM_VALUES: PersonaFormValues = { name: '', prompt: '' }

export default function PersonaModal(): React.JSX.Element {
  const {
    isPersonaModalOpen,
    editPersona: editingPersona,
    savePersona,
    closePersonaModal
  } = usePersonaContext()

  const form = useForm<PersonaFormValues>()
  const reset = form.reset

  useEffect(() => {
    const values =
      isPersonaModalOpen && editingPersona
        ? { name: editingPersona.name ?? '', prompt: editingPersona.prompt ?? '' }
        : EMPTY_FORM_VALUES
    reset(values)
  }, [editingPersona, isPersonaModalOpen, reset])

  const onSubmit = useCallback(
    ({ name, prompt }: PersonaFormValues): void => {
      savePersona({
        id: editingPersona?.id,
        name,
        prompt
      })
    },
    [editingPersona?.id, savePersona]
  )

  const handleOpenChange = useCallback(
    (nextOpen: boolean): void => {
      if (!nextOpen) {
        closePersonaModal()
      }
    },
    [closePersonaModal]
  )

  return (
    <Dialog open={isPersonaModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-background w-full max-w-3xl rounded-2xl p-4 shadow-xl md:max-w-4xl md:p-8">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="text-primary/30 font-serif text-xl" aria-hidden="true">
              ✦
            </span>
            <DialogTitle className="font-display text-xl font-medium tracking-tight text-balance md:text-2xl">
              {editingPersona ? 'Edit Persona' : 'Create Persona'}
            </DialogTitle>
          </div>
          <p className="text-muted-foreground mt-1 ml-7 font-serif text-sm text-pretty italic">
            {editingPersona
              ? 'Modify your custom AI personality'
              : 'Define a new AI personality for your conversations'}
          </p>
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
                      placeholder="Name"
                      autoComplete="off"
                      className="placeholder:text-foreground/60"
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
                      placeholder="Prompt"
                      rows={12}
                      autoComplete="off"
                      className="placeholder:text-foreground/60 min-h-56 md:min-h-80"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-8 gap-3">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={closePersonaModal}
                  className="hover:bg-muted/50 min-w-24 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="default"
                type="submit"
                className="min-w-24 rounded-xl transition-transform duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              >
                Save Persona
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
