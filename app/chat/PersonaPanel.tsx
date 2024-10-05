'use client'

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
  TextField
} from '@radix-ui/themes'
import { debounce } from 'lodash-es'
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import { LuMessageSquarePlus } from 'react-icons/lu'
import { ChatContext, Persona } from '@/components'

export interface PersonaPanelProps {}

const PersonaPanel = (_props: PersonaPanelProps) => {
  const {
    personaPanelType,
    DefaultPersonas,
    personas,
    openPersonaPanel,
    onDeletePersona,
    onEditPersona,
    onCreateChat,
    onOpenPersonaModal,
    onClosePersonaPanel
  } = useContext(ChatContext)

  const [promptList, setPromptList] = useState<Persona[]>([])
  const [searchText, setSearchText] = useState('')

  const handleSearch = useCallback(
    debounce((type: string, list: Persona[], searchText: string) => {
      setPromptList(
        list.filter((item) => {
          if (type === 'chat') {
            return (
              !item.key && (item.prompt?.includes(searchText) || item.name?.includes(searchText))
            )
          } else {
            return (
              item.key && (item.prompt?.includes(searchText) || item.name?.includes(searchText))
            )
          }
        })
      )
    }, 350),
    []
  )

  useEffect(() => {
    handleSearch(personaPanelType, [...DefaultPersonas, ...personas], searchText)
  }, [personaPanelType, searchText, DefaultPersonas, personas, handleSearch])

  return openPersonaPanel ? (
    <Flex
      direction="column"
      width="100%"
      height="100%"
      className="absolute top-0 z-10 flex-1"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Flex
        justify="between"
        align="center"
        py="3"
        px="4"
        style={{ backgroundColor: 'var(--gray-a2)' }}
      >
        <Heading size="4">Persona Store </Heading>
        <IconButton
          size="2"
          variant="ghost"
          color="gray"
          radius="full"
          onClick={onClosePersonaPanel}
        >
          <AiOutlineClose className="size-4" />
        </IconButton>
      </Flex>
      <Container size="3" className="grow-0 px-4">
        <Flex gap="4" py="5">
          <TextField.Root
            size="3"
            className="flex-1"
            radius="large"
            placeholder="Search Persona Template"
            onChange={({ target }) => {
              setSearchText(target.value)
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <Button size="3" radius="large" variant="surface" onClick={onOpenPersonaModal}>
            Create
          </Button>
        </Flex>
      </Container>
      <ScrollArea className="flex-1" type="auto" scrollbars="vertical">
        <Container size="3" className="px-4">
          <Flex direction="column" className="divide-y">
            {promptList.map((prompt) => (
              <Flex
                key={prompt.id}
                align="center"
                justify="between"
                gap="3"
                py="3"
                style={{ borderColor: 'var(--gray-a5)' }}
              >
                <Box width="100%">
                  <Text as="p" size="3" weight="bold" className="mb-2">
                    {prompt.name}
                  </Text>
                  <Text as="p" size="2" className="line-clamp-2">
                    {prompt.prompt || ''}
                  </Text>
                </Box>
                <Flex gap="3">
                  <IconButton
                    size="2"
                    variant="soft"
                    radius="full"
                    onClick={() => {
                      onCreateChat?.(prompt)
                    }}
                  >
                    <LuMessageSquarePlus className="size-4" />
                  </IconButton>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="gray"
                    radius="full"
                    onClick={() => {
                      onEditPersona?.(prompt)
                    }}
                  >
                    <AiOutlineEdit className="size-4" />
                  </IconButton>
                  <IconButton
                    size="2"
                    variant="soft"
                    color="crimson"
                    radius="full"
                    onClick={() => {
                      onDeletePersona?.(prompt)
                    }}
                  >
                    <AiOutlineDelete className="size-4" />
                  </IconButton>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Container>
      </ScrollArea>
    </Flex>
  ) : null
}

export default PersonaPanel
