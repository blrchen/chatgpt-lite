'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Chat from '@/components/chat/chat'
import { SideBar } from '@/components/chat/sidebar'
import { Header } from '@/components/header/header'
import { SidebarProvider } from '@/components/ui/sidebar'
import type { Persona } from '@/lib/types'
import { cn } from '@/lib/utils'
import { selectHydrate, selectOnCreateChat, useChatStore } from '@/store/chat-store'
import {
  selectClosePersonaPanel,
  selectPersonaModalOpen,
  selectPersonaPanelOpen,
  usePersonaUiStore
} from '@/store/persona-ui-store'

const PersonaModal = dynamic(() => import('./persona-modal'))
const PersonaPanel = dynamic(() => import('./persona-panel'))

function ChatExperience(): React.JSX.Element {
  const onCreateChat = useChatStore(selectOnCreateChat)
  const closePersonaPanel = usePersonaUiStore(selectClosePersonaPanel)
  const isPersonaModalOpen = usePersonaUiStore(selectPersonaModalOpen)
  const isPersonaPanelOpen = usePersonaUiStore(selectPersonaPanelOpen)

  const [animReady, setAnimReady] = useState(false)
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      startTransition(() => {
        setAnimReady(true)
      })
    })
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])
  const handleStartPersonaChat = useCallback(
    (persona: Persona) => {
      onCreateChat(persona)
      closePersonaPanel()
    },
    [closePersonaPanel, onCreateChat]
  )

  return (
    <SidebarProvider
      className={cn(
        'reduced-motion-sidebar min-h-0 flex-1',
        !animReady &&
          '[&_[data-slot=sidebar-container]]:!duration-0 [&_[data-slot=sidebar-gap]]:!duration-0'
      )}
    >
      <SideBar />
      <div
        data-slot="sidebar-inset"
        className={cn(
          'bg-background relative flex w-full flex-1 flex-col',
          'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
          'min-h-0 overflow-hidden'
        )}
      >
        <Header />
        <Chat />
        {isPersonaPanelOpen ? <PersonaPanel onStartChat={handleStartPersonaChat} /> : null}
      </div>
      {isPersonaModalOpen ? <PersonaModal /> : null}
    </SidebarProvider>
  )
}

export default function ChatPageClient(): React.JSX.Element {
  const hydrate = useChatStore(selectHydrate)

  useEffect(() => {
    startTransition(() => {
      hydrate()
    })
  }, [hydrate])

  return <ChatExperience />
}
