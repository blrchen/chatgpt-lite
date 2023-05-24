import { createContext } from 'react'

const GlobalContext = createContext<{
  onSearch?: (value: string) => void
}>({})

export default GlobalContext
