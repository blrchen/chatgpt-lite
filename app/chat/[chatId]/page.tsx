import ChatIdPage from '@/components/Chat/ChatIdPage';

export default async function Page({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = await params;
  return <ChatIdPage chatId={resolvedParams.chatId} />;
}
