import { Flex, Heading, Separator } from '@radix-ui/themes'

const NotFound = () => {
  return (
    <Flex justify="center" align="center" className="flex flex-1">
      <Flex gap="3" align="center">
        <Heading as="h2" size="6" weight="medium">
          404
        </Heading>
        <Separator orientation="vertical" style={{ height: 'var(--space-6)' }} />
        This page could not be found.
      </Flex>
    </Flex>
  )
}

export default NotFound
