import React from 'react'

import { Layout } from 'antd'

import styles from './index.module.less'
import Link from "antd/lib/typography/Link";
const { Header } = Layout

const HeaderBar = () => {
  return (
    <>
      <Header className={styles.header}>
        <div className={styles.logoBar}>
            <h1>Unleash Your Creativity with ChatGPT</h1>
        </div>
      </Header>
      <div className={styles.vacancy} />
    </>
  )
}

export default HeaderBar
