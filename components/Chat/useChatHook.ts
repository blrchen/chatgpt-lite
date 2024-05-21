'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { v4 as uuid } from 'uuid'
import { ChatGPInstance } from './Chat'
import { Chat, ChatMessage, Persona } from './interface'

export const DefaultPersonas: Persona[] = [
  {
    id: 'chatgpt',
    role: 'system',
    name: 'Chat',
    prompt: 'You are an AI assistant that helps people find information.',
    displayPrompt: `Welcome to la familia! 👋
      Amigo, it's great to see you here! I'm wearing my best sombrero for the occasion!
      What can I do for you?  Just write in the chat and I'll reply.
      If you need more specialized help, go to Persona store and I'll become an expert in that area =)
    `,
    isDefault: true,
    avatar: '/bot-icon.png'
  },
  {
    id: 'summarizer',
    role: 'assistant',
    name: 'Summarizer',
    displayPrompt: `Send me a large text that needs to be shortened as a post, file, link or youtube video and I'll pick out the key thoughts.`,
    prompt: `You've been designed to be a summarizer. Your task is to summarize a text for me. Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/summarizer.png'
  },
  {
    id: 'rewriting-pro',
    role: 'assistant',
    name: 'Rewriting Pro',
    displayPrompt: `I can rewrite any text without anyone recognising it. Send a text, a file or a link and I will do it all.`,
    prompt: `You're rewriter with a huge experience of it. Your task is rewrite text which I will send you. Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/rewriting-pro.png'
  },
  {
    id: 'seo-specialist',
    role: 'assistant',
    name: 'SEO Specialist',
    displayPrompt: `I know how to compose SEO text and will help get your site to the top! Tell me your topic.`,
    prompt: `write well-structured SEO text with headings and key words. {{request}}`,
    isDefault: false,
    avatar: '/persona/seo-specialist.png'
  },
  {
    id: 'youTube-scenarist',
    role: 'assistant',
    name: 'YouTube Scenarist',
    displayPrompt: `I can write a detailed scenario for your video! Describe the theme of your video.`,
    prompt: `You're an experienced content creator who excels in brainstorming ideas for YouTube videos across various genres like tutorials, entertainment, informative content, and vlogs. You are known for crafting engaging, informative, and visually appealing content that captivates viewers' attention.Your task is to brainstorm a bundle of ideas for a YouTube video. Include specific timings for each segment, texts or key points to cover, and hashtags for optimal visibility.Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/youTube-scenarist.png'
  },
  {
    id: 'hashTag-tool',
    role: 'assistant',
    name: 'HashTag tool',
    displayPrompt: `I'll write popular hashtags for you, all I need from you is a theme.`,
    prompt: `You’re a digital marketing expert specializing in hashtags. You need to generate a list of trend hashtags of {{request}}.Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/hashTag-tool.png'
  },
  {
    id: 'promote-plan-writer',
    role: 'assistant',
    name: 'Promote Plan Writer',
    displayPrompt: `I can think of a name and description for your business! what's your business about?`,
    prompt: `Generate a response as if you are the Brand Creator bot. The Brand Creator bot is a creative tool that helps users generate unique and innovative brand names, slogans, and logos. The user does not provide any specific request, so please generate a few examples of brand names, slogans, and logo ideas.Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/promotion-planner.png'
  },
  {
    id: 'post-ideas',
    role: 'assistant',
    name: 'Post Ideas',
    displayPrompt: `Ready to write post ideas and hashtags for your blog. What's it about?`,
    prompt: `You’re an experienced social media manager for a popular lifestyle brand. Your specialty lies in creating engaging and trending blog posts for various social media platforms, incorporating relevant hashtags to increase visibility and reach. Your task is to generate blog post ideas along with suitable hashtags for different platforms of {{request}}.For this task, focus on creating blog post content that resonates with the target audience, ranging from lifestyle tips, fashion insights, beauty trends, travel recommendations, and wellness advice. Include a mix of informative, entertaining, and inspiring content to keep the followers engaged.When suggesting hashtags, consider popular and niche tags related to each post's theme to maximize post visibility and engagement. Strive to strike a balance between trending hashtags and brand-specific tags to enhance the brand's online presence and connect with a wider audience.Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/homework-solwer.png'
  },
  {
    id: 'youTube-titles',
    role: 'assistant',
    name: 'YouTube Titles',
    displayPrompt: `Writing a title is easy! Tell me, what will the video be about?`,
    prompt: `You're an advanced AI system designed to help users generate engaging and catchy YouTube titles for their videos of {{request}}. Your primary focus is to create titles that are not only descriptive but also appeal to a broad audience. Your task is to generate a list of compelling YouTube titles for a variety of video content. The titles should be attention-grabbing, concise, and relevant to the video's topic. Please remember to consider the content of the video, target audience, keywords, and SEO optimization when generating the titles.Write your response in the language of the  {{request}}`,
    isDefault: false,
    avatar: '/persona/youTube-titles.png'
  },
  {
    id: 'image-generator',
    role: 'assistant',
    name: 'Image generator',
    displayPrompt: `Describe the picture and I will bring it to life! 🖼️
    Write as detailed a photo enquiry as possible
    For example:" photorealistic,high detailed, round orange, 35mm, lying on a table under the light of the sun"
    `,
    prompt: `Opens the chat with image generation API integrated. https://aimlapi.com/models/stable-diffusion-21`,
    isDefault: false,
    avatar: '/persona/image-generator.png'
  },
]

enum StorageKeys {
  Chat_List = 'chatList',
  Chat_Current_ID = 'chatCurrentID'
}

const uploadFiles = async (files: File[]) => {
  let formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })
  const { data } = await axios<any>({
    method: 'POST',
    url: '/api/document/upload',
    data: formData,
    timeout: 1000 * 60 * 5
  })
  return data
}

let isInit = false

const useChatHook = () => {
  const searchParams = useSearchParams()

  const debug = searchParams.get('debug') === 'true'

  const [_, forceUpdate] = useReducer((x: number) => x + 1, 0)

  const messagesMap = useRef<Map<string, ChatMessage[]>>(new Map<string, ChatMessage[]>())

  const chatRef = useRef<ChatGPInstance>(null)

  const currentChatRef = useRef<Chat | undefined>(undefined)

  const [chatList, setChatList] = useState<Chat[]>([])

  const [personas, setPersonas] = useState<Persona[]>([])

  const [editPersona, setEditPersona] = useState<Persona | undefined>()

  const [isOpenPersonaModal, setIsOpenPersonaModal] = useState<boolean>(false)

  const [personaModalLoading, setPersonaModalLoading] = useState<boolean>(false)

  const [openPersonaPanel, setOpenPersonaPanel] = useState<boolean>(false)

  const [personaPanelType, setPersonaPanelType] = useState<string>('')

  const [toggleSidebar, setToggleSidebar] = useState<boolean>(false)

  const onOpenPersonaPanel = (type: string = 'chat') => {
    setPersonaPanelType(type)
    setOpenPersonaPanel(true)
  }

  const onClosePersonaPanel = useCallback(() => {
    setOpenPersonaPanel(false)
  }, [setOpenPersonaPanel])

  const onOpenPersonaModal = () => {
    setIsOpenPersonaModal(true)
  }

  const onClosePersonaModal = () => {
    setEditPersona(undefined)
    setIsOpenPersonaModal(false)
  }

  const onChangeChat = useCallback((chat: Chat) => {
    const oldMessages = chatRef.current?.getConversation() || []
    const newMessages = messagesMap.current.get(chat.id) || chat.messages || []
    chatRef.current?.setConversation(newMessages)
    chatRef.current?.focus()
    messagesMap.current.set(currentChatRef.current?.id!, oldMessages)
    currentChatRef.current = chat
    forceUpdate()
  }, [])

  const onCreateChat = useCallback(
    (persona: Persona) => {
      const id = uuid()
      const newChat: Chat = {
        id,
        persona: persona,
      }

      if (persona.displayPrompt) {
        newChat.messages = [{
          content: persona.displayPrompt,
          role: persona.role
        }]
      }

      setChatList((state) => {
        return [...state, newChat]
      })

      onChangeChat(newChat)
      onClosePersonaPanel()
    },
    [setChatList, onChangeChat, onClosePersonaPanel]
  )

  const onToggleSidebar = useCallback(() => {
    setToggleSidebar((state) => !state)
  }, [])

  const onDeleteChat = (chat: Chat) => {
    const index = chatList.findIndex((item) => item.id === chat.id)
    chatList.splice(index, 1)
    setChatList([...chatList])
    localStorage.removeItem(`ms_${chat.id}`)

    if (currentChatRef.current?.id === chat.id) {
      currentChatRef.current = chatList[0]
    }

    if (chatList.length === 0) {
      onOpenPersonaPanel('chat')
    }
  }

  const onCreatePersona = async (values: any) => {
    const { type, name, prompt, files } = values
    const persona: Persona = {
      id: uuid(),
      role: 'system',
      name,
      prompt,
      key: ''
    }

    if (type === 'document') {
      try {
        setPersonaModalLoading(true)
        const data = await uploadFiles(files)
        persona.key = data.key
      } catch (e) {
        console.log(e)
        toast.error('Error uploading files')
      } finally {
        setPersonaModalLoading(false)
      }
    }

    setPersonas((state) => {
      const index = state.findIndex((item) => item.id === editPersona?.id)
      if (index === -1) {
        state.push(persona)
      } else {
        state.splice(index, 1, persona)
      }
      return [...state]
    })

    onClosePersonaModal()
  }

  const onEditPersona = async (persona: Persona) => {
    setEditPersona(persona)
    onOpenPersonaModal()
  }

  const onDeletePersona = (persona: Persona) => {
    setPersonas((state) => {
      const index = state.findIndex((item) => item.id === persona.id)
      state.splice(index, 1)
      return [...state]
    })
  }

  const saveMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      localStorage.setItem(`ms_${currentChatRef.current?.id}`, JSON.stringify(messages))
    } else {
      localStorage.removeItem(`ms_${currentChatRef.current?.id}`)
    }
  }

  useEffect(() => {
    const chatList = (JSON.parse(localStorage.getItem(StorageKeys.Chat_List) || '[]') ||
      []) as Chat[]
    const currentChatId = localStorage.getItem(StorageKeys.Chat_Current_ID)
    if (chatList.length > 0) {
      const currentChat = chatList.find((chat) => chat.id === currentChatId)
      setChatList(chatList)

      chatList.forEach((chat) => {
        const messages = JSON.parse(localStorage.getItem(`ms_${chat?.id}`) || '[]') as ChatMessage[]
        messagesMap.current.set(chat.id!, messages)
      })

      onChangeChat(currentChat || chatList[0])
    } else {
      onCreateChat(DefaultPersonas[0])
    }

    return () => {
      document.body.removeAttribute('style')
      localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
    }
  }, [])

  useEffect(() => {
    if (currentChatRef.current?.id) {
      localStorage.setItem(StorageKeys.Chat_Current_ID, currentChatRef.current.id)
    }
  }, [currentChatRef.current?.id])

  useEffect(() => {
    localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
  }, [chatList])

  useEffect(() => {
    const loadedPersonas = JSON.parse(localStorage.getItem('Personas') || '[]') as Persona[]
    const updatedPersonas = loadedPersonas.map((persona) => {
      if (!persona.id) {
        persona.id = uuid()
      }
      return persona
    })
    setPersonas(updatedPersonas)
  }, [])

  useEffect(() => {
    localStorage.setItem('Personas', JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    if (isInit && !openPersonaPanel && chatList.length === 0) {
      onCreateChat(DefaultPersonas[0])
    }
    isInit = true
  }, [chatList, openPersonaPanel, onCreateChat])

  return {
    debug,
    DefaultPersonas,
    chatRef,
    currentChatRef,
    chatList,
    personas,
    editPersona,
    isOpenPersonaModal,
    personaModalLoading,
    openPersonaPanel,
    personaPanelType,
    toggleSidebar,
    onOpenPersonaModal,
    onClosePersonaModal,
    onCreateChat,
    onDeleteChat,
    onChangeChat,
    onCreatePersona,
    onDeletePersona,
    onEditPersona,
    saveMessages,
    onOpenPersonaPanel,
    onClosePersonaPanel,
    onToggleSidebar,
    forceUpdate
  }
}

export default useChatHook
