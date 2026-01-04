'use client'

import { ClassAttributes, HTMLAttributes, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import ReactMarkdown, { ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema, type Options as SanitizeOptions } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { PluggableList } from 'unified'

import styles from './markdown.module.css'

// Extend default schema to allow KaTeX elements and common safe attributes
const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'math',
    'semantics',
    'mrow',
    'mi',
    'mo',
    'mn',
    'msup',
    'msub',
    'mfrac',
    'munder',
    'mover',
    'msqrt',
    'mroot',
    'mtable',
    'mtr',
    'mtd',
    'mtext',
    'mspace',
    'annotation',
    'span'
  ],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'class', 'style'],
    span: ['className', 'class', 'style', 'aria-hidden'],
    math: ['xmlns', 'display'],
    annotation: ['encoding']
  }
}

// Only include actual plugins - react-markdown handles parse/rehype/stringify internally
const remarkPluginList = [remarkGfm, remarkMath]
const rehypePluginList: PluggableList = [rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex]

export interface MarkdownProps {
  className?: string
  children: string
}

const HighlightCode = (
  props: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps
) => {
  const { children, className, ref, ...rest } = props
  const match = /language-(\w+)/.exec(className || '')
  const { resolvedTheme } = useTheme()
  const { copy, copied } = useCopyToClipboard()

  const code = match ? String(children).replace(/\n$/, '') : ''

  const onCopy = useCallback(() => {
    void copy(code)
  }, [code, copy])

  return match ? (
    <div className={clsx(styles.codeBlock, 'border-border overflow-hidden rounded-xl border')}>
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        onClick={onCopy}
        className="absolute top-2 right-2 z-10 md:top-3 md:right-3"
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <SyntaxHighlighter
        {...rest}
        style={resolvedTheme === 'dark' ? oneDark : oneLight}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.75rem',
          background: 'transparent'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code
      ref={ref}
      {...rest}
      className={clsx(
        'bg-muted text-muted-foreground rounded px-1 py-0.5 font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  )
}

export const Markdown = memo(function Markdown({ className, children }: MarkdownProps) {
  return (
    <div
      className={clsx(
        styles.markdown,
        'prose dark:prose-invert max-w-none break-normal',
        '[&_.katex]{font-size:1em;}',
        'prose-img:max-w-[48rem] lg:prose-img:max-w-full',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPluginList}
        rehypePlugins={rehypePluginList}
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
})
