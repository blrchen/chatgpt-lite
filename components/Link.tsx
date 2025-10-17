import NextLink from 'next/link'
interface LinkProps {
  href: string
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  highContrast?: boolean
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target']
}

export const Link = ({ href, children, target, disabled }: LinkProps) => {
  return (
    <NextLink
      className="text-primary hover:underline"
      href={href}
      target={target}
      passHref
      aria-disabled={disabled}
    >
      {children}
    </NextLink>
  )
}
