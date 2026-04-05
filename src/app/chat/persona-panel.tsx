'use client'

import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  type ComponentProps
} from 'react'
import { AppButton, AppIconButton } from '@/components/common/app-button'
import { ButtonWithTooltip } from '@/components/common/button-with-tooltip'
import { ConfirmActionDialog } from '@/components/common/confirm-action-dialog'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DefaultPersona, DefaultPersonas } from '@/lib/chat-utils'
import type { Persona } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isMobileViewport } from '@/lib/viewport'
import { selectDeletePersona, selectPersonas, usePersonaStore } from '@/store/persona-store'
import {
  selectClosePersonaPanel,
  selectOnPersonaDeleted,
  selectOpenCreatePersonaModal,
  selectOpenEditPersonaModal,
  usePersonaUiStore
} from '@/store/persona-ui-store'
import { MessageSquarePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Dialog as DialogPrimitive } from 'radix-ui'

type PersonaPanelProps = {
  onStartChat: (persona: Persona) => void
}

type CreatePersonaButtonProps = {
  className?: string
  onClick: () => void
  size?: ComponentProps<typeof AppButton>['size']
}

function preloadPersonaModal(): void {
  if (typeof window !== 'undefined') {
    void import('./persona-modal')
  }
}

function CreatePersonaButton({
  className = '',
  onClick,
  size
}: CreatePersonaButtonProps): React.JSX.Element {
  return (
    <AppButton
      size={size}
      onClick={onClick}
      onMouseEnter={preloadPersonaModal}
      onFocus={preloadPersonaModal}
      className={cn(
        'bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-lg px-5 hover:shadow-md',
        className
      )}
    >
      <Plus className="size-4" aria-hidden="true" />
      <span>Create persona</span>
    </AppButton>
  )
}

export default function PersonaPanel({ onStartChat }: PersonaPanelProps): React.JSX.Element {
  const personas = usePersonaStore(selectPersonas)
  const deletePersona = usePersonaStore(selectDeletePersona)
  const openCreatePersonaModal = usePersonaUiStore(selectOpenCreatePersonaModal)
  const openEditPersonaModal = usePersonaUiStore(selectOpenEditPersonaModal)
  const closePersonaPanel = usePersonaUiStore(selectClosePersonaPanel)
  const onPersonaDeleted = usePersonaUiStore(selectOnPersonaDeleted)

  const [searchText, setSearchText] = useState('')
  const [personaPendingDelete, setPersonaPendingDelete] = useState<Persona | null>(null)
  const deferredSearchText = useDeferredValue(searchText)
  const { resolvedTheme } = useTheme()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const filteredPersonas = useMemo(() => {
    const allPersonas = [...DefaultPersonas, ...personas]
    const keyword = deferredSearchText.toLowerCase()

    if (!keyword) {
      return allPersonas
    }

    const matchesSearch = (persona: Persona): boolean => {
      const nameMatch = persona.name?.toLowerCase().includes(keyword) ?? false
      const promptMatch = persona.prompt.toLowerCase().includes(keyword)
      return nameMatch || promptMatch
    }

    return allPersonas.filter(matchesSearch)
  }, [deferredSearchText, personas])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closePersonaPanel()
    },
    [closePersonaPanel]
  )

  const handleDeletePersona = useCallback((persona: Persona): void => {
    setPersonaPendingDelete(persona)
  }, [])

  const confirmDeletePersona = useCallback((): void => {
    if (!personaPendingDelete) {
      return
    }

    deletePersona(personaPendingDelete)
    onPersonaDeleted(personaPendingDelete.id)

    setPersonaPendingDelete(null)
  }, [deletePersona, onPersonaDeleted, personaPendingDelete])

  const handleDeleteConfirmOpenChange = useCallback((open: boolean): void => {
    if (!open) {
      setPersonaPendingDelete(null)
    }
  }, [])

  return (
    <DialogPrimitive.Root open onOpenChange={handleOpenChange}>
      {/* Panel */}
      <DialogPrimitive.Content
        className="bg-background overscroll-behavior-contain absolute inset-0 z-50 flex size-full flex-col overflow-hidden"
        data-theme={resolvedTheme}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          if (!isMobileViewport()) {
            searchInputRef.current?.focus()
          } else {
            closeButtonRef.current?.focus()
          }
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="border-border/60 bg-card flex items-center justify-between border-b px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-4">
          <div className="flex items-start gap-2">
            <span className="text-primary/30 font-serif text-2xl" aria-hidden="true">
              ❧
            </span>
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title asChild>
                <h2 className="text-card-foreground font-display text-xl font-medium tracking-tight text-balance">
                  Persona Library
                </h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-muted-foreground text-xs text-pretty">
                Choose a conversation style
              </DialogPrimitive.Description>
            </div>
          </div>
          <ButtonWithTooltip label="Close persona library" placement="bottom">
            <AppIconButton
              ref={closeButtonRef}
              variant="ghost"
              onClick={closePersonaPanel}
              aria-label="Close persona library"
              className="hover:bg-muted/80 -mr-2 rounded-full transition-colors duration-200"
            >
              <X className="size-5" aria-hidden="true" />
            </AppIconButton>
          </ButtonWithTooltip>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex w-full gap-3">
            <div className="group relative flex-1">
              <span className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors duration-200">
                <Search className="size-4" aria-hidden="true" />
              </span>
              <label className="sr-only" htmlFor="persona-search">
                Search personas
              </label>
              <Input
                type="search"
                id="persona-search"
                name="persona-search"
                ref={searchInputRef}
                className="border-border/50 bg-card/50 focus:border-primary/40 focus:bg-card placeholder:text-muted-foreground h-11 rounded-xl pl-10 shadow-sm transition-colors duration-200 focus:shadow-md"
                placeholder="Search by name or prompt…"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <CreatePersonaButton className="flex-shrink-0" onClick={openCreatePersonaModal} />
          </div>
        </div>
        <ScrollArea className="overscroll-behavior-contain flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {filteredPersonas.length === 0 ? (
            <Empty className="items-start gap-3 border-0 px-0 py-16 text-left">
              <EmptyHeader className="items-start text-left">
                <EmptyTitle className="text-muted-foreground text-sm font-normal text-pretty">
                  No personas match your search.
                </EmptyTitle>
              </EmptyHeader>
              <EmptyContent className="max-w-none items-start">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  {searchText.trim() ? (
                    <AppButton
                      size="sm"
                      variant="outline"
                      onClick={() => setSearchText('')}
                      className="rounded-lg"
                    >
                      Clear search
                    </AppButton>
                  ) : null}
                  <CreatePersonaButton size="sm" onClick={openCreatePersonaModal} />
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPersonas.map((persona, index) => (
                <div
                  key={persona.id ?? `persona-${index}`}
                  className="bg-card border-border/40 hover:border-primary/50 focus-within:border-primary/50 group relative flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-colors duration-200 [contain-intrinsic-size:auto_160px] [content-visibility:auto] focus-within:shadow-lg hover:shadow-lg sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100" />
                  <div className="bg-primary/60 absolute top-3 bottom-3 left-0 w-0.5 rounded-full opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100" />
                  <div className="relative min-w-0 flex-1">
                    <p className="text-foreground mb-1 truncate font-medium">{persona.name}</p>
                    <p className="text-muted-foreground line-clamp-2 text-sm text-pretty">
                      {persona.prompt || 'No prompt defined'}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
                    <AppButton
                      size="sm"
                      onClick={() => onStartChat(persona)}
                      className="bg-foreground text-background hover:bg-foreground/90 w-full gap-1.5 rounded-lg px-4 font-medium sm:w-auto"
                    >
                      <MessageSquarePlus className="size-4" aria-hidden="true" />
                      <span>Start</span>
                    </AppButton>
                    {persona.id !== DefaultPersona.id && (
                      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                        <AppButton
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPersonaModal(persona.id)}
                          onMouseEnter={preloadPersonaModal}
                          onFocus={preloadPersonaModal}
                          className="hover:bg-muted/50 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span>Edit</span>
                        </AppButton>
                        <AppButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePersona(persona)}
                          className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive/70 hover:bg-destructive/10 w-full gap-1.5 rounded-lg px-3 sm:w-auto"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span>Delete</span>
                        </AppButton>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogPrimitive.Content>
      {/* Mobile overlay - appears behind sidebar on mobile when sidebar is open */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close persona library"
        className="bg-overlay fixed inset-0 z-40 backdrop-blur-sm md:hidden"
        onClick={closePersonaPanel}
      />
      <ConfirmActionDialog
        open={personaPendingDelete !== null}
        onOpenChange={handleDeleteConfirmOpenChange}
        title="Delete this persona?"
        description="You cannot undo this change."
        confirmLabel="Delete persona"
        confirmVariant="destructive"
        onConfirm={confirmDeletePersona}
      />
    </DialogPrimitive.Root>
  )
}
