import ChatGPT from "@/components/ChatGPT";

export default function Home() {
  return (
    <>
      <ChatGPT fetchPath="http://localhost:3000/api/generate" />
    </>
  )
}
