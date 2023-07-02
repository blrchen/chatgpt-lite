'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RemarkMathPlugin from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface MarkdownProps {
  className?: string
  content: string
}

const Markdown = (props: MarkdownProps) => {
  const { className, content } = props

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm, RemarkMathPlugin]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...rest }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              {...rest}
              className="rounded"
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        }
      }}
      linkTarget="_blank"
    >
      {content}
    </ReactMarkdown>
  )
}

export default Markdown
