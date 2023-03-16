import React from 'react'

import { Layout } from 'antd'
import { Link } from 'react-router-dom'

import styles from './index.module.less'
const { Header } = Layout

const HeaderBar = () => {
  return (
    <>
      <Header className={styles.header}>
        <div className={styles.logoBar}>
          <Link to="/">
            <img alt="logo" src="/logo192.png" />
            <h1>Unleash Your Creativity with ChatGPT</h1>
          </Link>
        </div>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}

export default HeaderBar
