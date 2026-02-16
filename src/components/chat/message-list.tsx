'use client'

import { useMemo } from 'react'
import type { ChatMessage } from '@/components/chat/interface'
import { Message } from '@/components/chat/message'
import { findLastMessageIndex } from '@/components/chat/utils'

export interface MessageListProps {
  messages: ChatMessage[]
  isStreaming?: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps): React.JSX.Element {
  const lastAssistantIndex = useMemo(
    () => (isStreaming ? findLastMessageIndex(messages, 'assistant') : -1),
    [isStreaming, messages]
  )

  const messageNodes = useMemo(
    () =>
      messages.map((item, index) => (
        <Message
          key={item.id}
          message={item}
          isThinking={Boolean(isStreaming) && index === lastAssistantIndex}
        />
      )),
    [isStreaming, lastAssistantIndex, messages]
  )

  return <div className="space-y-4">{messageNodes}</div>
}
