import { ComponentProps } from 'react'
import { Link as RadixLink } from '@radix-ui/themes'
import NextLink from 'next/link'

type LinkOwnProps = ComponentProps<typeof RadixLink>

interface LinkProps {
  href: string
  className?: string
  color?: LinkOwnProps['color']
  children?: React.ReactNode
  disabled?: boolean
  highContrast?: boolean
}

export const Link = ({ href, className, children, color, highContrast, disabled }: LinkProps) => {
  return (
    <NextLink href={href} passHref legacyBehavior aria-disabled={disabled}>
      <RadixLink
        className={className}
        color={color}
        aria-disabled={disabled}
        highContrast={highContrast}
      >
        {children}
      </RadixLink>
    </NextLink>
  )
}

export default Link
