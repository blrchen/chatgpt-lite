import React from 'react'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from '@/pages/App'

import reportWebVitals from './reportWebVitals'
import './index.less'

dayjs.extend(utc)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <Router>
    <App />
  </Router>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
