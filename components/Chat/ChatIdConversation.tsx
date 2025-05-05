'use client'
import { useEffect, useState, useRef } from 'react';
import { ChatMessage, Chat } from './interface';
import useChatHook from './useChatHook';

interface ChatIdConversationProps {
  chatId: string;
  hideActions?: boolean;
}

export default function ChatIdConversation({ chatId, hideActions = false }: ChatIdConversationProps) {
  const chatHook = useChatHook();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[ChatIdConversation] Loading messages for chatId:', chatId);
    setIsInitialLoading(true);
    setError(null);

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`);
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        const data = await response.json();
        console.log('[ChatIdConversation] Loaded messages from Firebase:', data.messages);
        console.log('[ChatIdConversation] Messages length:', data.messages.length);
        console.log('[ChatIdConversation] Last message:', data.messages[data.messages.length - 1]);

        setMessages(data.messages || []);

        // Check for unhandled initial message
        if (data.messages.length > 0 && data.messages[data.messages.length - 1].role === 'user') {
          const lastMessage = data.messages[data.messages.length - 1];
          console.log('[ChatIdConversation] Found initial user message:', lastMessage);
          setTimeout(() => {
            console.log('[ChatIdConversation] Starting to handle initial message');
            handleInitialMessage(lastMessage);
          }, 0);
        } else {
          console.log('[ChatIdConversation] No initial user message found');
        }
      } catch (error) {
        console.error('[ChatIdConversation] Failed to load messages:', error);
        setError(error instanceof Error ? error.message : 'Failed to load messages');
        setMessages([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInitialMessage = async (message: ChatMessage) => {
    // 1. Show thinking message
    const thinkingMessage: ChatMessage = {
      role: 'assistant',
      content: 'MaraiX is thinking...'
    };
    const messagesWithThinking = [...messages, thinkingMessage];
    setMessages(messagesWithThinking);

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesWithThinking }),
      });
    } catch (error) {
      console.error('Error saving thinking message:', error);
    }

    setIsLoading(true);

    // 2. Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Show final response
    const finalResponse: ChatMessage = {
      role: 'assistant',
      content: 'Yes, you will receive 100 USDC for your 1 SOL swap. Would you like to proceed with the transaction?'
    };
    const finalMessages = [...messages, finalResponse];
    setMessages(finalMessages);

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: finalMessages }),
      });
    } catch (error) {
      console.error('Error saving final response:', error);
    }

    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. Add user message
    const newMessage: ChatMessage = {
      role: 'user',
      content: input,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    setInput('');
    setIsLoading(true);

    // 2. Show thinking message
    const thinkingMessage: ChatMessage = {
      role: 'assistant',
      content: 'MaraiX is thinking...'
    };
    const messagesWithThinking = [...updatedMessages, thinkingMessage];
    setMessages(messagesWithThinking);

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesWithThinking }),
      });
    } catch (error) {
      console.error('Error saving thinking message:', error);
    }

    // 3. Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Show final response
    const finalResponse: ChatMessage = {
      role: 'assistant',
      content: 'Yes, you will receive 100 USDC for your 1 SOL swap. Would you like to proceed with the transaction?'
    };
    const finalMessages = [...updatedMessages, finalResponse];
    setMessages(finalMessages);

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: finalMessages }),
      });
    } catch (error) {
      console.error('Error saving final response:', error);
    }

    setIsLoading(false);
  };

  const setMessage = (message: string) => {
    setInput(message);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex w-full px-2 py-4 max-w-full last:border-b-0 h-fit flex-col gap-2 md:flex-row md:gap-4 md:px-4 border-b border-gray-200`}
          >
            <div className="flex items-center md:items-start gap-2 md:gap-4">
              <div className="hidden md:flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full bg-gray-100 border border-gray-200">
                {message.role === 'user' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-6 md:h-6 text-gray-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-6 md:h-6 text-gray-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold md:hidden text-gray-900">
                {message.role === 'user' ? 'You' : 'MaraiX'}
              </p>
            </div>
            <div className="pt-2 w-full max-w-full md:flex-1 md:w-0 overflow-hidden flex flex-col gap-2">
              <div className="prose break-words prose-p:leading-relaxed prose-pre:p-0 flex flex-col gap-4">
                <p className="text-sm md:text-base">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 w-full p-2 mt-auto absolute bottom-0">
        <form className="w-full rounded-md flex flex-col overflow-hidden transition-colors duration-200 ease-in-out border border-transparent shadow-none bg-gray-100 focus-within:border-blue-500">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask MaraiX anything..."
            className="w-full max-h-60 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none"
            style={{ height: '36px !important' }}
            disabled={isLoading}
          />
          <div className="flex items-center justify-end px-2 pb-2">
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 hover:bg-gray-200/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-600">
                <polyline points="15 10 20 15 15 20"></polyline>
                <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
              </svg>
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
