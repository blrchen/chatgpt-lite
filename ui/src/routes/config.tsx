import React, { lazy, ReactNode, Suspense } from 'react'

import type { RouteObject } from 'react-router-dom'

import Loading from '@/components/Loading'
import AppLayout from '@/layouts/AppLayout'

const ChatGPT = lazy(() => import('@/pages/ChatGPT'))

const lazyLoad = (children: ReactNode): ReactNode => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export const routers: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: lazyLoad(<ChatGPT />)
      },
      {
        path: '/ChatGPT',
        element: lazyLoad(<ChatGPT />)
      },
      {
        path: '*',
        element: lazyLoad(<ChatGPT />)
      }
    ]
  }
]
