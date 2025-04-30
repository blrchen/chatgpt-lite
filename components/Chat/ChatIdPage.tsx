'use client'
import ChatIdConversation from './ChatIdConversation';

export default function ChatIdPage({ chatId }: { chatId: string }) {
  // Dedicated conversation component for /chat/[chatId]
  return <ChatIdConversation chatId={chatId} />;
}
