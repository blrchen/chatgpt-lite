import ReactMarkdown from 'react-markdown'

import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'

import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'

import { RxClipboardCopy } from 'react-icons/rx'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { IconButton } from '@radix-ui/themes'

export interface MarkdownProps {
  className?: string
  children: string
}

export const Markdown = ({ className, children }: MarkdownProps) => {
  return (
    <ReactMarkdown
      className="prose dark:prose-invert max-w-none"
      remarkPlugins={[remarkParse, remarkMath, remarkRehype, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeStringify]}
      components={{
        code(props) {
          const { children, className, node, ref, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          return (
            <>
              <IconButton
                className="absolute right-4 top-4 copy-btn"
                variant="solid"
                data-clipboard-text={children}
              >
                <RxClipboardCopy />
              </IconButton>
              {match ? (
                <SyntaxHighlighter {...rest} style={vscDarkPlus} language={match[1]} PreTag="div">
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code ref={ref} {...rest} className={className}>
                  {children}
                </code>
              )}
            </>
          )
        }
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default Markdown
