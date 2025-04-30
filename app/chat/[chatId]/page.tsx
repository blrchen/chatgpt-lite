import { useRouter } from 'next/navigation';
import ChatIdPage from '@/components/Chat/ChatIdPage';

export default function Page({ params }: { params: { chatId: string } }) {
  // 你可以在 ChatPage 里用 chatId 做 chat 切换
  return <ChatIdPage chatId={params.chatId} />;
}
