import React, { lazy, ReactNode, Suspense } from 'react'

import type { RouteObject } from 'react-router-dom'

import Loading from '@/components/Loading'
import BaseLayout from '@/layouts/BaseLayout'
const Chat = lazy(() => import('@/static/Chat'))

const lazyLoad = (children: ReactNode): ReactNode => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export const routers: RouteObject[] = [
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        index: true,
        path: '/',
        element: lazyLoad(<Chat />)
      },
      {
        path: '*',
        element: lazyLoad(<Chat />)
      }
    ]
  }
]
