import { useChatMessagesContext } from '@/components/chat/chat-session-context'
import { ChatStreamError } from '@/components/chat/chat-stream-error'
import { Message } from '@/components/chat/message'
import { isStreamingStatus } from '@/lib/chat-utils'

export function MessageList(): React.JSX.Element {
  const { messages, streamStatus, streamPhase, error, onDismissError } = useChatMessagesContext()
  const isStreaming = isStreamingStatus(streamStatus)
  const lastMessageIndex = messages.length - 1
  const lastAssistantIndex =
    isStreaming && lastMessageIndex >= 0 && messages[lastMessageIndex].role === 'assistant'
      ? lastMessageIndex
      : -1

  return (
    <div className="flex flex-col gap-5">
      {messages.map((item, index) => {
        const isLastStreaming = isStreaming && index === lastAssistantIndex
        return (
          <div
            key={item.id}
            className="[contain-intrinsic-size:auto_80px] [content-visibility:auto]"
          >
            <Message
              message={item}
              isThinking={isLastStreaming}
              streamPhase={isLastStreaming ? streamPhase : undefined}
            />
          </div>
        )
      })}
      <ChatStreamError error={error} onDismissError={onDismissError} />
    </div>
  )
}
