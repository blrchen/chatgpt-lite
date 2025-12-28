'use client'

import { useCallback, useMemo, useState } from 'react'
import { Persona } from '@/components/chat'
import { usePersonaContext } from '@/components/chat/personaContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/contexts/app'
import { cn } from '@/lib/utils'
import { MessageSquarePlus, Pencil, Search, Trash2, X } from 'lucide-react'
import { useTheme } from 'next-themes'

type PersonaPanelProps = {
  onStartChat: (persona: Persona) => void
}

const PersonaPanel = ({ onStartChat }: PersonaPanelProps) => {
  const {
    defaultPersonas,
    personas,
    deletePersona,
    openCreatePersonaModal,
    openEditPersonaModal,
    getPersonaById
  } = usePersonaContext()
  const { personaPanelOpen, closePersonaPanel } = useAppContext()

  const [searchText, setSearchText] = useState('')
  const { resolvedTheme } = useTheme()

  const filteredPersonas = useMemo(() => {
    const allPersonas = [...defaultPersonas, ...personas]
    const keyword = searchText.toLowerCase()

    if (!keyword) {
      return allPersonas
    }

    return allPersonas.filter(
      (persona) =>
        (persona.prompt?.toLowerCase() || '').includes(keyword) ||
        (persona.name?.toLowerCase() || '').includes(keyword)
    )
  }, [defaultPersonas, personas, searchText])

  const handleStartChat = useCallback(
    (persona: Persona) => {
      const resolvedPersona = persona.id ? (getPersonaById(persona.id) ?? persona) : persona
      onStartChat(resolvedPersona)
    },
    [getPersonaById, onStartChat]
  )

  return personaPanelOpen ? (
    <>
      {/* Mobile overlay - appears behind sidebar on mobile when sidebar is open */}
      <div
        className="bg-overlay fixed inset-0 z-50 backdrop-blur-sm md:hidden"
        onClick={closePersonaPanel}
      />
      {/* Panel */}
      <div
        className={cn(
          'bg-background absolute inset-0 z-60 flex h-full w-full flex-col overflow-hidden transition-all',
          // Ensure it doesn't overlap sidebar on any screen size
          'md:z-50'
        )}
        data-theme={resolvedTheme}
      >
        <div className="border-border bg-card flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-card-foreground text-lg font-semibold">Persona Store</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={closePersonaPanel}
            aria-label="Close persona store"
            title="Close persona store"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex w-full gap-2">
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                <Search className="size-4" />
              </span>
              <label className="sr-only" htmlFor="persona-search">
                Search persona templates
              </label>
              <Input
                type="text"
                id="persona-search"
                className="pl-9"
                placeholder="Search Persona Template"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button className="flex-shrink-0" onClick={openCreatePersonaModal}>
              Create
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto px-4 pb-4 md:pb-0">
          <div className="flex flex-col gap-3">
            {filteredPersonas.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-card flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 truncate font-medium">{prompt.name}</p>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {prompt.prompt || ''}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStartChat(prompt)}
                    className="w-full gap-1.5 px-3 font-semibold sm:w-auto"
                  >
                    <MessageSquarePlus className="size-4" />
                    <span>New Chat</span>
                  </Button>
                  <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        openEditPersonaModal(prompt)
                      }}
                      className="w-full gap-1.5 px-3 font-semibold sm:w-auto"
                    >
                      <Pencil className="size-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        deletePersona(prompt)
                      }}
                      className="w-full gap-1.5 px-3 sm:w-auto"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
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
