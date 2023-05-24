import App from '@/static/App'
import { useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

export default function Home() {
  const [content, setContent] = useState<any>(null)
  useEffect(() => {
    setContent(
      <Router>
        <App />
      </Router>
    )
  }, [])

  return <>{content}</>
}
