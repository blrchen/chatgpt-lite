'use client'

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { debounce } from 'lodash-es'
import { useTheme } from 'next-themes'
import { AiOutlineClose, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import { LuMessageSquarePlus } from 'react-icons/lu'
import { ChatContext, Persona } from '@/components/chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const PersonaPanel = () => {
  const {
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
  const { resolvedTheme } = useTheme()

  const handleSearch = useCallback(
    debounce((list: Persona[], searchText: string) => {
      setPromptList(
        list.filter((item) => item.prompt?.includes(searchText) || item.name?.includes(searchText))
      )
    }, 350),
    []
  )

  useEffect(() => {
    handleSearch([...DefaultPersonas, ...personas], searchText)
  }, [searchText, DefaultPersonas, personas, handleSearch])

  return openPersonaPanel ? (
    <>
      {/* Mobile overlay - appears behind sidebar on mobile when sidebar is open */}
      <div
        className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm md:hidden"
        onClick={onClosePersonaPanel}
      />
      {/* Panel */}
      <div
        className={cn(
          'absolute inset-0 z-60 flex flex-col bg-background transition-all w-full h-full overflow-hidden',
          // Ensure it doesn't overlap sidebar on any screen size
          'md:z-50'
        )}
        data-theme={resolvedTheme}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-card-foreground">Persona Store</h2>
          <Button size="icon" variant="ghost" onClick={onClosePersonaPanel}>
            <AiOutlineClose className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-4 py-4 flex flex-col gap-4">
          <div className="flex gap-2 w-full">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </span>
              <Input
                type="text"
                className="pl-9"
                placeholder="Search Persona Template"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button className="flex-shrink-0" onClick={onOpenPersonaModal}>
              Create
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 pb-4 md:pb-0 overflow-y-auto">
          <div className="flex flex-col divide-y">
            {promptList.map((prompt) => (
              <div
                key={prompt.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="mb-1 font-medium truncate">{prompt.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prompt.prompt || ''}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      onCreateChat?.(prompt)
                    }}
                    className="rounded-full hover:bg-accent hover:text-accent-foreground"
                  >
                    <LuMessageSquarePlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      onEditPersona?.(prompt)
                    }}
                    className="rounded-full hover:bg-accent hover:text-accent-foreground"
                  >
                    <AiOutlineEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      onDeletePersona?.(prompt)
                    }}
                    className="rounded-full"
                  >
                    <AiOutlineDelete className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  ) : null
}

export default PersonaPanel
