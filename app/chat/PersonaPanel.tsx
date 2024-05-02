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
import _ from 'lodash'
import { debounce } from 'lodash-es'
import Image from 'next/image'
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineUp,
  AiOutlineDown
} from 'react-icons/ai'
import { LuMessageSquarePlus } from 'react-icons/lu'
import { ChatContext, Persona } from '@/components'
import { getPrompts } from '../network/getPrompts'

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
  const [brands, setBrands] = useState<(string | undefined)[]>([])
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  const fetchPrompts = async () => {
    const data = await getPrompts()
    setPrompts(data)
    getBrand(data)
    console.log(brands)
  }
  useEffect(() => {
    fetchPrompts()
  }, [])
  const [prompts, setPrompts] = useState<Persona[]>([])
  const toggleAccordion = (brand: string) => {
    setExpandedBrand(expandedBrand === brand ? null : brand)
  }
  // Création d'un tableau contenant uniquement les marques uniques des prompts
  const SolidBrand = [
    {
      name: 'SGIT',
      logo: '/logoSGIT.svg',
      dbName: 'sgit'
    },
    {
      name: 'Odalys Vacances',
      logo: '/logo-Odalys.png',
      dbName: 'odalysVacances'
    },
    {
      name: 'Happy Senior',
      logo: 'logoHP.svg',
      dbName: 'happySenior'
    }
  ]

  const getBrand = (promptList: Persona[]) => {
    const brandsliste = promptList.map((item) => item.brand)

    const uniqueBrands = _.uniq(brandsliste)
    setBrands(uniqueBrands)
  }
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
    handleSearch(personaPanelType, [...DefaultPersonas, ...personas, ...prompts], searchText)
  }, [personaPanelType, searchText, DefaultPersonas, personas, prompts, handleSearch])

  return openPersonaPanel ? (
    <Flex
      direction="column"
      width="100%"
      height="100%"
      className="absolute top-0 z-10 flex-1"
      style={{ backgroundColor: 'var(--color-page-background)' }}
    >
      <Flex
        justify="between"
        align="center"
        py="3"
        px="4"
        style={{ backgroundColor: 'var(--gray-a2)' }}
      >
        <Heading size="4">Bibliothèque de prompts</Heading>
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
          <TextField.Root size="3" className="flex-1" radius="large">
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              className="flex-1"
              placeholder="Search Persona Template"
              onChange={({ target }) => {
                setSearchText(target.value)
              }}
            />
          </TextField.Root>
          <Button size="3" radius="large" variant="surface" onClick={onOpenPersonaModal}>
            Create
          </Button>
        </Flex>
      </Container>
      <ScrollArea className="flex-1" type="auto" scrollbars="vertical">
        <Container size="3" className="px-4">
          <Flex direction="column" className="divide-y">
            {/* Affichage des prompts triés par marque */}

            {SolidBrand.map((brand) => (
              <div key={brand.dbName}>
                <Flex
                  align="center"
                  justify="between"
                  className="mb-2 cursor-pointer"
                  onClick={() => brand && toggleAccordion(brand.name)}
                >
                  <Image src={brand.logo} alt={brand.name} width={150} height={102} />

                  <Text as="p" size="4" weight="bold">
                    {brand.name}
                  </Text>
                  {expandedBrand === brand.dbName ? (
                    <AiOutlineUp className="ml-2 justify-end" />
                  ) : (
                    <AiOutlineDown className="ml-2 justify-end" />
                  )}
                </Flex>
                {expandedBrand === brand.name &&
                  promptList
                    .filter((prompt) => prompt.brand === brand.dbName)
                    .map((prompt) => (
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
              </div>
            ))}
          </Flex>
        </Container>
      </ScrollArea>
    </Flex>
  ) : null
}

export default PersonaPanel
