import { type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type TooltipPlacement = 'top' | 'bottom' | 'right'

const TOOLTIP_PLACEMENT_CONFIG: Record<
  TooltipPlacement,
  { side: ComponentProps<typeof TooltipContent>['side']; sideOffset: number; className?: string }
> = {
  top: { side: 'top', sideOffset: 6 },
  bottom: { side: 'bottom', sideOffset: 6 },
  right: { side: 'right', sideOffset: 8, className: 'max-w-72' }
}

type ButtonWithTooltipProps = {
  children: ReactElement
  label: ReactNode
  placement?: TooltipPlacement
  contentClassName?: string
  align?: ComponentProps<typeof TooltipContent>['align']
}

export function ButtonWithTooltip({
  children,
  label,
  placement = 'top',
  contentClassName,
  align
}: ButtonWithTooltipProps): React.JSX.Element {
  const config = TOOLTIP_PLACEMENT_CONFIG[placement]

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={config.side}
        sideOffset={config.sideOffset}
        align={align}
        className={cn('text-xs', config.className, contentClassName)}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
