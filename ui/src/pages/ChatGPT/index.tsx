import React from 'react'

import ChatGPT from '@/components/ChatGPT'
const ChatGPTDemo = () => {
  return <ChatGPT fetchPath="https://chatgptdemo-westus3.azurewebsites.net/api/generate" />
  // return <ChatGPT fetchPath="http://localhost:3000/api/generate" />
}

export default ChatGPTDemo
