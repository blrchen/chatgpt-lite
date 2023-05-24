import React, { forwardRef } from 'react'

import { ChatGPInstance, ChatGPTProps, ChatRole } from './interface'
import MessageItem from './MessageItem'
import SendBar from './SendBar'
import { useChatGPT } from './useChatGPT'

import './index.less'
import 'highlight.js/styles/atom-one-dark.css'

const ChatGPT = (props: ChatGPTProps, ref: any) => {
  const {
    loading,
    disabled,
    messages,
    currentMessage,
    onSettings,
    inputRef,
    onSend,
    onClear,
    onStop
  } = useChatGPT(props, ref)
  const { header } = props
  return (
    <div className="chat-wrapper">
      {header}
      <div className="message-list">
        {messages.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))}
        {currentMessage.current && (
          <MessageItem message={{ content: currentMessage.current, role: ChatRole.Assistant }} />
        )}
      </div>
      <SendBar
        loading={loading}
        disabled={disabled}
        inputRef={inputRef}
        onSettings={onSettings}
        onSend={onSend}
        onClear={onClear}
        onStop={onStop}
      />
    </div>
  )
}

export default forwardRef<ChatGPInstance, ChatGPTProps>(ChatGPT)
