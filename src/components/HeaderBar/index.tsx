import React from 'react'

import { CompressOutlined, ExpandOutlined, GithubOutlined } from '@ant-design/icons'
import { Layout, Space, Typography } from 'antd'

import styles from './index.module.less'

const { Link } = Typography

const { Header } = Layout

const HeaderBar = () => {
  return (
    <>
      <Header className={styles.header}>
        <div className={styles.logoBar}>
          <Link href="/">
            <img alt="logo" src="/logo192.png" />
            <h1>GPT Lite</h1>
          </Link>
        </div>
        <Space className={styles.right} size={0}>
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
