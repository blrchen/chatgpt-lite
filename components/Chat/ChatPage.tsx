// @ts-nocheck
'use client'
import React from 'react';
import { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Chat from './Chat';
import useChatHook from './useChatHook';

export default function ChatPage({ chatId }: { chatId?: string }) {
  React.useEffect(() => {
    // Prevent body scroll and set background color
    const originalOverflow = document.body.style.overflow;
    const originalBg = document.body.style.backgroundColor;
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#0E0F12';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  console.log('[ChatPage] render', { chatId });
  const chatHook = useChatHook();
  console.log('[ChatPage] useChatHook result:', chatHook);
  return <Chat chatId={chatId} />;
}
