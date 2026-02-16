import { buildMessageContentFromParts, getTextFromParts } from '@/components/chat/chat-attachments'
import type { ChatMessage, MessageContent } from '@/components/chat/interface'
import { findLastMessageIndex } from '@/components/chat/utils'
import { DefaultChatTransport } from 'ai'

type ChatCompletionMessage = {
  role: 'assistant' | 'user' | 'system'
  content: MessageContent
}

type ChatRequestBody = {
  prompt: string
  messages: ChatCompletionMessage[]
  input: MessageContent
}

function toChatCompletionMessage(message: ChatMessage): ChatCompletionMessage {
  if (message.role === 'assistant' || message.role === 'system') {
    return {
      role: message.role,
      content: getTextFromParts(message.parts ?? [])
    }
  }

  return {
    role: 'user',
    content: buildMessageContentFromParts(message.parts ?? [])
  }
}

export function createChatTransport() {
  return new DefaultChatTransport<ChatMessage>({
    api: '/api/chat',
    prepareSendMessagesRequest: ({ messages, body, headers }) => {
      const prompt = typeof body?.prompt === 'string' ? body.prompt : ''
      const lastUserIndex = findLastMessageIndex(messages, 'user')
      const inputMessage = lastUserIndex >= 0 ? messages[lastUserIndex] : undefined
      const historyMessages = lastUserIndex >= 0 ? messages.slice(0, lastUserIndex) : messages

      const payload: ChatRequestBody = {
        prompt,
        messages: historyMessages.map(toChatCompletionMessage),
        input: inputMessage ? buildMessageContentFromParts(inputMessage.parts ?? []) : ''
      }

      return {
        headers: {
          ...headers,
          Accept: 'text/event-stream'
        },
        body: payload
      }
    }
  })
}
