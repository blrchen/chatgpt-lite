import { useId, type ComponentProps } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'

type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (nextOpen: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  cancelLabel?: string
  confirmVariant?: ComponentProps<typeof AlertDialogAction>['variant']
  confirmClassName?: string
  rememberChoiceLabel?: string
  rememberChoice?: boolean
  onRememberChoiceChange?: (nextChecked: boolean) => void
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  confirmClassName,
  rememberChoiceLabel,
  rememberChoice,
  onRememberChoiceChange
}: ConfirmActionDialogProps): React.JSX.Element {
  const rememberChoiceId = useId()
  const shouldRenderRememberChoice =
    typeof rememberChoiceLabel === 'string' &&
    typeof rememberChoice === 'boolean' &&
    typeof onRememberChoiceChange === 'function'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-balance">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-pretty">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {shouldRenderRememberChoice ? (
          <Field orientation="horizontal" className="gap-0">
            <FieldLabel
              htmlFor={rememberChoiceId}
              className="text-muted-foreground w-fit cursor-pointer items-center gap-2 font-normal"
            >
              <Checkbox
                id={rememberChoiceId}
                checked={rememberChoice}
                onCheckedChange={(checked) => onRememberChoiceChange(checked === true)}
              />
              <span>{rememberChoiceLabel}</span>
            </FieldLabel>
          </Field>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            onClick={onConfirm}
            className={confirmClassName}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
