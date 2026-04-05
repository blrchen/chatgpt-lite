import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TOUCH_BUTTON_CLASS = 'h-11 md:h-9'
const TOUCH_ICON_BUTTON_CLASS = 'size-11 md:size-9'
const MUTED_DISABLED_CLASS = 'disabled:opacity-100 disabled:bg-muted disabled:text-muted-foreground'

type AppButtonProps = React.ComponentProps<typeof Button> & {
  touch?: boolean
  mutedDisabled?: boolean
}

const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  { className, touch = true, mutedDisabled = true, ...props },
  ref
): React.JSX.Element {
  return (
    <Button
      ref={ref}
      className={cn(touch && TOUCH_BUTTON_CLASS, mutedDisabled && MUTED_DISABLED_CLASS, className)}
      {...props}
    />
  )
})

const AppIconButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(function AppIconButton(
  { className, size = 'icon', touch = true, mutedDisabled = true, ...props },
  ref
): React.JSX.Element {
  return (
    <Button
      ref={ref}
      size={size}
      className={cn(
        touch && TOUCH_ICON_BUTTON_CLASS,
        mutedDisabled && MUTED_DISABLED_CLASS,
        className
      )}
      {...props}
    />
  )
})

export { AppButton, AppIconButton }
