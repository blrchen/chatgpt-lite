import React from 'react'

import { ShowProps } from './interface'

const Show = (props: ShowProps) => {
  const { loading, fallback, children } = props

  return <>{loading ? fallback : children}</>
}

export default Show
