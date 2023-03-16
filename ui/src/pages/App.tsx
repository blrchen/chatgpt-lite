import React from 'react'

import { QueryClient, QueryClientProvider } from 'react-query'

import { Routers } from '@/routes'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routers />
    </QueryClientProvider>
  )
}

export default App
