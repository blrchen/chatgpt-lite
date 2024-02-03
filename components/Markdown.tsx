import { IconButton } from '@radix-ui/themes'
import cs from 'classnames'
import { RxClipboardCopy } from 'react-icons/rx'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

export interface MarkdownProps {
  className?: string
  children: string
}

export const Markdown = ({ className, children }: MarkdownProps) => {
  return (
    <ReactMarkdown
      className={cs('prose dark:prose-invert max-w-none', className)}
      remarkPlugins={[remarkParse, remarkMath, remarkRehype, remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeKatex, rehypeStringify]}
      components={{
        code(props) {
          const { children, className, node, ref, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <>
              <IconButton
                className="absolute right-4 top-4 copy-btn cursor-pointer"
                variant="solid"
                data-clipboard-text={children}
              >
                <RxClipboardCopy />
              </IconButton>
              <SyntaxHighlighter {...rest} style={vscDarkPlus} language={match[1]} PreTag="div">
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </>
          ) : (
            <code ref={ref} {...rest} className={cs('highlight', className)}>
              {children}
            </code>
          )
        }
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default Markdown
