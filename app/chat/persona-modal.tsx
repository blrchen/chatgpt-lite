import React, { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import ChatContext from '@/components/chat/chatContext'
import type { Persona } from '@/components/chat/interface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const PersonaModal = () => {
  const {
    isOpenPersonaModal: open,
    editPersona: detail,
    onCreateOrUpdatePersona,
    onClosePersonaModal
  } = useContext(ChatContext)

  const form = useForm<{
    name: string
    prompt: string
    role: string
  }>()

  useEffect(() => {
    if (open && detail) {
      form.setValue('name', detail.name ?? '')
      form.setValue('prompt', detail.prompt ?? '')
    } else if (open && !detail) {
      form.reset({ name: '', prompt: '' })
    }
    if (!open) {
      form.reset({ name: '', prompt: '' })
    }
  }, [open, detail, form])

  const onSubmit = ({ name, prompt }: { name: string; prompt: string }) => {
    const values = form.getValues()
    console.log('formSubmit', { name, prompt }, values)
    const persona: Persona = { name, prompt, role: 'assistant' }
    onCreateOrUpdatePersona?.(persona)
  }

  return (
    <Dialog open={!!open} onOpenChange={onClosePersonaModal}>
      <DialogContent className="w-full max-w-3xl md:max-w-4xl rounded-2xl p-4 md:p-8 bg-background shadow-xl transition-all">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {detail ? 'Edit Persona Prompt' : 'Create Persona Prompt'}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
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
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-base shadow-sm focus:outline-none focus:ring focus:ring-primary/50"
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
                      className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-base shadow-sm resize-none focus:outline-none focus:ring focus:ring-primary/50 min-h-[220px] md:min-h-[320px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-row gap-4 justify-end mt-8">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClosePersonaModal}
                  className="min-w-[96px]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="default" type="submit" className="min-w-[96px]">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PersonaModal
