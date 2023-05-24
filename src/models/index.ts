export interface Message {
  role: Role
  content: string
}
export interface ChatConfig {
  model?: ChatGPTVersion
  stream?: boolean
}

export enum ChatGPTVersion {
  GPT_35_turbo = 'gpt-35-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k'
}
export type Role = 'assistant' | 'user'
