'use client'

import ChatContext from '@/contexts/chatContext'
import {
  Button,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemSuffix,
  Typography
} from '@material-tailwind/react'
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import { LuMessageSquarePlus } from 'react-icons/lu'
import { debounce } from 'lodash-es'
export interface PersonaPanelProps {}

const PersonaPanel = (props: PersonaPanelProps) => {
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
    [setPromptList]
  )

  useEffect(() => {
    handleSearch(personaPanelType, [...DefaultPersonas, ...personas], searchText)
  }, [personaPanelType, searchText, DefaultPersonas, personas, handleSearch])

  return openPersonaPanel ? (
    <div className="absolute top-0 z-10 h-full w-full flex-1 flex-col overflow-auto bg-white">
      <div className="sticky top-0 z-10">
        <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-blue-gray-900 ">
          {personaPanelType === 'chat' ? 'Persona Store' : 'Document Store'}
          <IconButton
            variant="outlined"
            color="blue-gray"
            size="sm"
            className="ml-auto"
            onClick={onClosePersonaPanel}
          >
            <AiOutlineClose className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="md:max-w-2xl lg:max-w-2xl xl:max-w-3xl m-auto w-full backdrop-saturate-200 backdrop-blur-2xl bg-opacity-80 px-4 bg-white">
          <div className="flex items-center gap-4 w-full py-4 ">
            <Input
              className="flex-1"
              label="Search Persona Template"
              onChange={({ target }) => {
                setSearchText(target.value)
              }}
            />
            <Button color="blue-gray" onClick={onOpenPersonaModal}>
              Create
            </Button>
          </div>
        </div>
      </div>
      <div className="md:max-w-2xl lg:max-w-2xl xl:max-w-3xl m-auto px-4 w-full">
        <List className="group border rounded-md border-blue-gray-200 p-0 my-2 gap-0 min-h-[300px] ">
          {promptList.map((prompt) => (
            <ListItem
              key={prompt.id}
              ripple={false}
              className="rounded-none border-b border-t-0 border-blue-gray-100 px-4 "
            >
              <div className="overflow-hidden ">
                <Typography color="blue-gray" className="font-normal">
                  {prompt.name}
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="font-normal text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {prompt.prompt || ''}
                </Typography>
              </div>
              <ListItemSuffix className="flex">
                <Button
                  variant="text"
                  size="sm"
                  color="blue-gray"
                  className="flex items-center gap-2 px-2"
                  onClick={() => {
                    onCreateChat?.(prompt)
                  }}
                >
                  <LuMessageSquarePlus className="h-4 w-4" />
                  Chat
                </Button>
                {personaPanelType === 'chat' && (
                  <Button
                    variant="text"
                    size="sm"
                    color="blue-gray"
                    className="flex items-center gap-2 px-2"
                    onClick={() => {
                      onEditPersona?.(prompt)
                    }}
                  >
                    <AiOutlineEdit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="text"
                  size="sm"
                  color="blue-gray"
                  className="flex items-center gap-2 px-2"
                  onClick={() => {
                    onDeletePersona?.(prompt)
                  }}
                >
                  <AiOutlineDelete className="h-4 w-4" />
                  Delete
                </Button>
              </ListItemSuffix>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  ) : null
}

export default PersonaPanel
