import NextLink from 'next/link'
import { Link as RadixLink, linkPropDefs, GetPropDefTypes } from '@radix-ui/themes'

type LinkOwnProps = GetPropDefTypes<typeof linkPropDefs>

interface LinkProps {
  href: string
  className?: string
  color?: LinkOwnProps['color']
  children?: React.ReactNode
}

export const Link = ({ href, className, children, color }: LinkProps) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <RadixLink className={className} color={color}>
        {children}
      </RadixLink>
    </NextLink>
  )
}

export default Link
