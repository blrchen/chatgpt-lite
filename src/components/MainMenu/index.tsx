import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import cs from 'classnames'
import { Menu, MenuProps } from 'antd'
import { BugOutlined, HomeOutlined } from '@ant-design/icons'

import styles from './index.module.less'

export interface MainMenuProps {
  style?: React.CSSProperties
  className?: string
  theme?: MenuProps['theme']
  mode?: MenuProps['mode']
}

const menuItems = [
  {
    key: '/home',
    icon: <HomeOutlined />,
    label: <Link to="/">Home</Link>
  },
  {
    key: '/feedback',
    icon: <BugOutlined />,
    label: <Link to="https://github.com/blrchen/gptlite/issues">Feedback</Link>
  }
]

const getMenuKey = (pathname: string) => {
  return pathname
}

const MainMenu = (props: MainMenuProps) => {
  const { style, className, theme, mode = 'inline' } = props

  const location = useLocation()

  const [current, setcurrent] = useState<string>(getMenuKey(location.pathname))

  useEffect(() => {
    setcurrent(getMenuKey(location.pathname))
  }, [location.pathname])

  return (
    <Menu
      style={style}
      className={cs(styles.menu, className)}
      items={menuItems}
      theme={theme}
      mode={mode}
      selectedKeys={[current]}
    />
  )
}

export default MainMenu
