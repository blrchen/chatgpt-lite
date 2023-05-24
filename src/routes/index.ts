import { useRoutes } from 'react-router-dom'

import { routers } from './config'

export const Routers = () => {
  return useRoutes(routers)
}
