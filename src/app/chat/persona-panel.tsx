'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Persona } from '@/components/chat/interface'
import { usePersonaContext } from '@/components/chat/personaContext'
import { DefaultPersona } from '@/components/chat/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/contexts/app'
import { MessageSquarePlus, Pencil, Search, Trash2, X } from 'lucide-react'
import { useTheme } from 'next-themes'

type PersonaPanelProps = {
  onStartChat: (persona: Persona) => void
}

export default function PersonaPanel({ onStartChat }: PersonaPanelProps): React.JSX.Element | null {
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
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const titleId = useId()

  const filteredPersonas = useMemo(() => {
    const allPersonas = [...defaultPersonas, ...personas]
    const keyword = searchText.toLowerCase()

    if (!keyword) {
      return allPersonas
    }

    const matchesSearch = (persona: Persona): boolean => {
      const nameMatch = persona.name?.toLowerCase().includes(keyword) ?? false
      const promptMatch = persona.prompt?.toLowerCase().includes(keyword) ?? false
      return nameMatch || promptMatch
    }

    return allPersonas.filter(matchesSearch)
  }, [defaultPersonas, personas, searchText])

  const handleStartChat = useCallback(
    (persona: Persona) => {
      let resolvedPersona = persona
      if (persona.id) {
        resolvedPersona = getPersonaById(persona.id) ?? persona
      }
      onStartChat(resolvedPersona)
    },
    [getPersonaById, onStartChat]
  )

  useEffect(() => {
    if (!personaPanelOpen) {
      return
    }
    // Allow the panel to mount before focusing the input.
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [personaPanelOpen])

  return personaPanelOpen ? (
    <>
      {/* Mobile overlay - appears behind sidebar on mobile when sidebar is open */}
      <div
        className="bg-overlay fixed inset-0 z-40 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        onClick={closePersonaPanel}
      />
      {/* Panel */}
      <div
        className="bg-background absolute inset-0 z-50 flex h-full w-full flex-col overflow-hidden"
        data-theme={resolvedTheme}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            closePersonaPanel()
          }
        }}
      >
        <div className="border-border/60 bg-card flex items-center justify-between border-b px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-primary/30 font-serif text-2xl" aria-hidden="true">
                ❧
              </span>
              <h2
                id={titleId}
                className="text-card-foreground font-display text-xl font-medium tracking-tight text-balance"
              >
                Persona Library
              </h2>
            </div>
            <p className="text-muted-foreground mt-1 ml-8 font-serif text-xs text-pretty italic">
              Choose a conversation style
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={closePersonaPanel}
            aria-label="Close persona library"
            title="Close persona library"
            className="hover:bg-muted/80 -mr-2 size-11 rounded-full transition-colors duration-200"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex w-full gap-3">
            <div className="group relative flex-1">
              <span className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors duration-200">
                <Search className="size-4" />
              </span>
              <label className="sr-only" htmlFor="persona-search">
                Search personas
              </label>
              <Input
                type="text"
                id="persona-search"
                ref={searchInputRef}
                className="border-border/50 bg-card/50 focus:border-primary/40 focus:bg-card placeholder:text-foreground/60 rounded-xl pl-10 shadow-sm transition-colors duration-200 focus:shadow-md"
                placeholder="Search by name or prompt..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 group flex-shrink-0 gap-1.5 rounded-xl px-5 transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              onClick={openCreatePersonaModal}
            >
              <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
                +
              </span>
              Create New
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {filteredPersonas.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-serif text-sm text-pretty italic">
                No personas match your search.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {searchText.trim() ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchText('')}
                    className="rounded-lg"
                  >
                    Clear search
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  onClick={openCreatePersonaModal}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-lg"
                >
                  Create persona
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredPersonas.map((persona, index) => (
                <div
                  key={persona.id ?? `persona-${index}`}
                  className="bg-card border-border/40 hover:border-primary/25 focus-within:border-primary/25 animate-in fade-in slide-in-from-bottom-2 group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 shadow-sm transition-colors duration-200 focus-within:shadow-lg hover:shadow-lg motion-reduce:animate-none sm:flex-row sm:items-center sm:gap-4"
                  style={{ animationDelay: `${Math.min(index * 24, 240)}ms` }}
                >
                  {/* Gradient accent on hover */}
                  <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100" />
                  {/* Left accent bar */}
                  <div className="bg-primary/60 absolute top-3 bottom-3 left-0 w-0.5 rounded-full opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100" />
                  <div className="relative min-w-0 flex-1">
                    <p className="text-foreground mb-1 truncate font-medium">{persona.name}</p>
                    <p className="text-muted-foreground line-clamp-2 font-serif text-sm text-pretty italic">
                      {persona.prompt || 'No prompt defined'}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(persona)}
                      className="bg-foreground text-background hover:bg-foreground/90 w-full gap-1.5 rounded-lg px-4 font-medium sm:w-auto"
                    >
                      <MessageSquarePlus className="size-4" />
                      <span>Start</span>
                    </Button>
                    {persona.id !== DefaultPersona.id && (
                      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPersonaModal(persona)}
                          className="hover:bg-muted/50 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                        >
                          <Pencil className="size-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePersona(persona)}
                          className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  ) : null
}
