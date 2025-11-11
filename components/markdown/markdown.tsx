'use client'

import { ClassAttributes, Fragment, HTMLAttributes, useCallback, useState } from 'react'
import clsx from 'clsx'
import { FaRegCopy, FaCheck } from 'react-icons/fa6'
import ReactMarkdown, { ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export interface MarkdownProps {
  className?: string
  children: string
}

const HighlightCode = (
  props: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps
) => {
  const { children, className, ref, ...rest } = props
  const match = /language-(\w+)/.exec(className || '')
  const copy = useCopyToClipboard()
  const [copied, setCopied] = useState<boolean>(false)

  const code = match ? String(children).replace(/\n$/, '') : ''

  const onCopy = useCallback(() => {
    copy(code, (isSuccess) => {
      if (isSuccess) {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 1500)
      }
    })
  }, [code, copy])

  return match ? (
    <Fragment>
      <button
        type="button"
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        onClick={onCopy}
        className={clsx(
          'absolute right-3 top-3 z-10',
          'rounded-md bg-muted text-muted-foreground p-2',
          'hover:bg-muted/80 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'flex items-center justify-center'
        )}
        tabIndex={0}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <FaCheck className="w-4 h-4 text-green-400" />
        ) : (
          <FaRegCopy className="w-4 h-4" />
        )}
      </button>
      <SyntaxHighlighter {...rest} style={vscDarkPlus} language={match[1]} PreTag="div">
        {code}
      </SyntaxHighlighter>
    </Fragment>
  ) : (
    <code
      ref={ref}
      {...rest}
      className={clsx(
        'px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800/60 font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  )
}

// GPT response renderer
export const Markdown = ({ className, children }: MarkdownProps) => {
  return (
    <div
      className={clsx(
        'prose dark:prose-invert max-w-none break-normal',
        '[&_.katex]{font-size:1em;}',
        'prose-img:max-w-[48rem] lg:prose-img:max-w-full',
        className
      )}
    >
      <style jsx global>{`
        .prose p {
          margin-top: 0.3em;
          margin-bottom: 0.3em;
        }
        .prose h1,
        .prose h2,
        .prose h3,
        .prose h4,
        .prose h5,
        .prose h6 {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose ul,
        .prose ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose blockquote {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose hr {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose pre {
          margin: 0.5em 0 !important;
          position: relative;
          background-color: hsl(var(--muted)) !important;
          overflow-x: auto;
        }
        .prose pre code {
          display: block;
          width: 100%;
          box-sizing: border-box;
          white-space: pre-wrap !important;
          overflow-wrap: anywhere !important;
          background: transparent !important;
        }
        .prose table {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose pre code span.token.table-header-row,
        .prose pre code span.token.table-line,
        .prose pre code span.token.table-data-rows {
          display: initial !important;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkParse, remarkMath, remarkRehype, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeStringify]}
        components={{
          code(props) {
            return <HighlightCode {...props} />
          },
          pre({ children, ...props }) {
            return <pre {...props}>{children}</pre>
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
