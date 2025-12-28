import { useEffect } from 'react'
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

const PersonaModal = () => {
  const {
    isPersonaModalOpen,
    editPersona: detail,
    savePersona,
    closePersonaModal
  } = usePersonaContext()

  const form = useForm<{
    name: string
    prompt: string
  }>()

  useEffect(() => {
    if (isPersonaModalOpen && detail) {
      form.setValue('name', detail.name ?? '')
      form.setValue('prompt', detail.prompt ?? '')
    } else if (isPersonaModalOpen && !detail) {
      form.reset({ name: '', prompt: '' })
    }
    if (!isPersonaModalOpen) {
      form.reset({ name: '', prompt: '' })
    }
  }, [isPersonaModalOpen, detail, form])

  const onSubmit = ({ name, prompt }: { name: string; prompt: string }) => {
    savePersona({
      id: detail?.id,
      name,
      prompt
    })
  }

  return (
    <Dialog
      open={isPersonaModalOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closePersonaModal()
        }
      }}
    >
      <DialogContent className="bg-background w-full max-w-3xl rounded-2xl p-4 shadow-xl transition-all md:max-w-4xl md:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {detail ? 'Edit Persona Prompt' : 'Create Persona Prompt'}
          </DialogTitle>
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
                    <Input {...field} type="text" placeholder="Name" autoComplete="off" />
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
                      className="min-h-[220px] md:min-h-[320px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-8 gap-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={closePersonaModal}
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
