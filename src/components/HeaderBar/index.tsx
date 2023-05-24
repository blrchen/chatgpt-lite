import React from 'react'

import { CompressOutlined, ExpandOutlined, GithubOutlined } from '@ant-design/icons'
import { Layout, Space, Typography } from 'antd'
import cs from 'classnames'
import { useFullScreen } from '@/hooks'

import styles from './index.module.less'

export interface HeaderBarProps {
  className?: string
  children?: React.ReactNode
}

const { Link } = Typography

const { Header } = Layout

const HeaderBar = (props: HeaderBarProps) => {
  const { className, children } = props
  const { fullScreen, toggleFullScreen } = useFullScreen()

  return (
    <>
      <Header className={cs(styles.header, className)}>
        <div className={styles.logoBar}>
          <Link href="/">
            <img alt="logo" src="/logo192.png" />
            <h1>GPT Lite (Preview)</h1>
          </Link>
        </div>
        {children}
        <Space className={styles.right} size={0}>
          <span className={styles.action} onClick={toggleFullScreen}>
            {fullScreen ? (
              <CompressOutlined style={{ fontSize: 16 }} />
            ) : (
              <ExpandOutlined style={{ fontSize: 16 }} />
            )}
          </span>
          <span className={styles.right}>
            <Link
              className={styles.action}
              href="https://github.com/blrchen/gptlite"
              target="_blank"
            >
              <GithubOutlined />
            </Link>
          </span>
        </Space>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}

export default HeaderBar
