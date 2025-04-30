'use client'
import { useEffect, useState } from 'react';
import useChatHook from './useChatHook';
import { ChatMessage, Chat } from './interface';
import SwapBridgeStakeActionButtons from './SwapBridgeStakeActionButtons';

interface ChatIdConversationProps {
  chatId: string;
}

export default function ChatIdConversation({ chatId }: ChatIdConversationProps) {
  const chatHook = useChatHook();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load messages for this chatId
  useEffect(() => {
    let chatMessages = chatHook.messagesMap.current.get(chatId);
    // 如果没有缓存，尝试从 localStorage 读取
    if (!chatMessages) {
      try {
        const local = localStorage.getItem(`ms_${chatId}`);
        if (local) {
          chatMessages = JSON.parse(local);
          // 更新到 messagesMap 里
          chatHook.messagesMap.current.set(chatId, chatMessages);
        } else {
          chatMessages = [];
        }
      } catch (e) {
        chatMessages = [];
      }
    }
    setMessages(chatMessages);
    console.log('[ChatIdConversation] chatId:', chatId, 'chatMessages:', chatMessages);


    // 自动补发：如果最后一条消息是 user 且没有 assistant 回复，则自动请求 API
    if (
      chatMessages &&
      chatMessages.length > 0 &&
      chatMessages[chatMessages.length - 1].role === 'user' &&
      (chatMessages.length === 1 || chatMessages[chatMessages.length - 2].role !== 'assistant')
    ) {
      // 自动请求 API 补 assistant 回复
      handleSend(chatMessages[chatMessages.length - 1].content, false);
    }
  }, [chatId, chatHook.messagesMap]);

  // 支持外部传入 input，isUser 控制是否 push user 消息
  const handleSend = async (externalInput?: string, isUser: boolean = true) => {
    const msg = (externalInput !== undefined ? externalInput : input).trim();
    if (!msg) return;
    setIsLoading(true);
    let newMessages = messages;
    if (isUser) {
      newMessages = [...messages, { role: 'user' as const, content: msg }];
      setMessages(newMessages);
      chatHook.saveMessages?.(newMessages);
      setInput('');
    }
    // 请求 API
    try {
      const response = await fetch('http://localhost:3009/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, timestamp: new Date().toISOString() })
      });
      const data = await response.json();
      if (data && data.result) {
        const updated = [...newMessages, { role: 'assistant' as const, content: data.result }];
        setMessages(updated);
        chatHook.saveMessages?.(updated);
      }
    } catch (e) {
      // 错误处理
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="block p-2 m-1 rounded bg-gray-100">{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="p-4 flex flex-col gap-2 border-t">
        <SwapBridgeStakeActionButtons />
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            placeholder="Type your message..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
