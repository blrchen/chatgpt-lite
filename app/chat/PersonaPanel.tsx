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
import { motion, AnimatePresence } from 'framer-motion'
import _ from 'lodash'
import { debounce } from 'lodash-es'
import Image from 'next/image'
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
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
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const fetchPrompts = async () => {
    const data = await getPrompts()
    setPromptList(data)
  }
  useEffect(() => {
    fetchPrompts()
  }, [])

  interface Brand {
    name: string
    logo: string
    dbName: string
    color: string
    description: string
    url: string
  }

  const SolidBrand: Brand[] = [
    {
      name: 'Odalys Vacances',
      logo: '/ODALYS-VACANCES-BLANC2.png',
      dbName: 'odalysVacances',
      color: '#3498DB',
      description: 'Résidences loisirs',
      url: 'https://www.odalys-vacances.com/'
    },
    {
      name: 'Odalys City',
      logo: '/ODALYS-CITY-BLANC.png',
      dbName: 'odalysCity',
      color: '#E74C3C',
      description: 'Résidences affaires',
      url: 'https://www.odalys-vacances.com/location-ville/'
    },
    {
      name: 'Odalys Campus',
      logo: '/ODALYS-CAMPUS-BLANC.png',
      dbName: 'odalysCampus',
      color: '#9B59B6',
      description: 'Résidences étudiantes',
      url: 'https://www.odalys-campus.com'
    },
    {
      name: 'Flower Campings',
      logo: '/Flower_Campings.png',
      dbName: 'flowerCampings',
      color: '#2ECC71',
      description: 'Hôtellerie de Plein Air',
      url: 'https://www.flowercampings.com/'
    },
    {
      name: 'Happy Senior',
      logo: '/logo-happy-senior.png',
      dbName: 'happySenior',
      color: '#F1C40F',
      description: 'Résidences seniors',
      url: 'https://residencehappysenior.fr/'
    },
    {
      name: 'SGIT Gestion',
      logo: '/Logo-SGIT-couleurs.jpg',
      dbName: 'sgitGestion',
      color: '#34495E',
      description: 'Gestion de copropriété',
      url: 'https://www.sgitgestion.com/'
    },
    {
      name: 'Odalys Invest',
      logo: '/ODALYS-INVEST-BLANC.png',
      dbName: 'odalysInvest',
      color: '#16A085',
      description: 'Investissement immobilier',
      url: 'https://www.odalys-invest.com/'
    },
    {
      name: 'Odalys Plein Air',
      logo: '/ODALYS-PLEIN-AIR-blanc.png',
      dbName: 'odalysPleinAir',
      color: '#2980B9',
      description: 'Vente de mobil-homes résidentiels',
      url: 'https://www.odalys-pleinair.com/'
    },
    {
      name: 'La Conciergerie by Odalys',
      logo: '/logo-conciergerie.png',
      dbName: 'laConciergerieByOdalys',
      color: '#8E44AD',
      description: 'Service de gestion de locations',
      url: 'https://www.laconciergerie-odalys.com/'
    },
    {
      name: 'Odalys evenements et groupes',
      logo: '/ODALYS-EVENEMENTS&GROUPES-BLANC.png',
      dbName: 'odalysEvenementsEtGroupes',
      color: '#2C3E50', // Bleu foncé
      description: 'Organisation d’événements et gestion de groupes',
      url: 'https://www.odalys-evenements-groupes.com/' // URL fictive, remplacez par l'URL réelle si disponible
    },
    {
      name: 'Odalys Groupe',
      logo: '/ODALYS-GROUPE-BLANC.png',
      dbName: 'odalysGroupe',
      color: '#2C3E50', // Bleu foncé
      description: 'Organisation d’événements et gestion de groupes',
      url: 'https://www.odalys-evenements-groupes.com/' // URL fictive, remplacez par l'URL réelle si disponible
    }
  ]

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName === selectedBrand ? null : brandName)
  }

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
        <Container className="px-4">
          <Flex direction="column" className="divide-y">
            <Flex wrap="wrap" gap="3" justify="center">
              {SolidBrand.map((brand) => (
                <motion.div
                  key={brand.dbName}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleBrandClick(brand.dbName)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: brand.color,
                    borderRadius: '10px',
                    padding: '20px', // Increased padding for larger size
                    width: '250px', // Fixed width for uniform size
                    height: '250px', // Fixed height for uniform size
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Image src={brand.logo} alt={brand.name} width={100} height={100} />
                  <Text size="3" style={{ color: 'white', marginTop: '10px' }}>
                    {brand.name}
                  </Text>
                </motion.div>
              ))}
            </Flex>
            {selectedBrand && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ marginTop: '20px' }}
                >
                  <Text
                    as="p"
                    size="5"
                    weight="bold"
                    style={{ textAlign: 'center', marginBottom: '10px' }}
                  >
                    Prompts for {selectedBrand}
                  </Text>
                  {promptList
                    .filter((prompt) => prompt.brand === selectedBrand)
                    .map((prompt) => (
                      <Flex
                        key={prompt.id}
                        align="center"
                        justify="between"
                        gap="3"
                        py="3"
                        style={{
                          borderColor: 'var(--gray-a5)',
                          borderBottom: '1px solid var(--gray-a5)'
                        }}
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
                </motion.div>
              </AnimatePresence>
            )}
          </Flex>
        </Container>
      </ScrollArea>
    </Flex>
  ) : null
}

export default PersonaPanel
