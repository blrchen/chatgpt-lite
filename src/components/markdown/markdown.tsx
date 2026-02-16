'use client'

import { forwardRef, memo, useCallback, type ClassAttributes, type HTMLAttributes } from 'react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useTheme } from 'next-themes'
import ReactMarkdown, { type ExtraProps } from 'react-markdown'
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
const remarkPluginList: PluggableList = [remarkGfm, remarkMath]
const rehypePluginList: PluggableList = [rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex]

const LANGUAGE_REGEX = /language-(\w+)/
const TRAILING_NEWLINE_REGEX = /\n$/
const CODE_BLOCK_CUSTOM_STYLE: React.CSSProperties = {
  margin: 0,
  padding: '1rem',
  borderRadius: '0.75rem',
  background: 'transparent'
}

export interface MarkdownProps {
  className?: string
  children: string
}

type HighlightCodeProps = ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps

type InlineCodeProps = Omit<HighlightCodeProps, 'ref'>

const InlineCode = memo(
  forwardRef<HTMLElement, InlineCodeProps>(function InlineCode(props, ref): React.JSX.Element {
    const { children, className, ...rest } = props

    return (
      <code
        ref={ref}
        {...rest}
        className={cn(
          'bg-muted/70 text-foreground/90 border-border/40 rounded-md border px-1.5 py-0.5 font-mono text-[0.875em] break-words',
          className
        )}
      >
        {children}
      </code>
    )
  })
)
InlineCode.displayName = 'InlineCode'

type CodeBlockProps = Omit<HighlightCodeProps, 'children' | 'className' | 'ref'> & {
  code: string
  language: string
}

const CodeBlock = memo(function CodeBlock(props: CodeBlockProps): React.JSX.Element {
  const { code, language, ...rest } = props
  const { resolvedTheme } = useTheme()
  const { copy, copied } = useCopyToClipboard()

  const onCopy = useCallback(() => {
    void copy(code)
  }, [code, copy])

  return (
    <div
      className={cn(
        styles.codeBlock,
        'border-border focus-within:ring-ring/50 focus-within:ring-offset-background overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-offset-2'
      )}
    >
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
        onClick={onCopy}
        className={cn(
          'group absolute top-2 right-2 z-10 transition-colors duration-200 md:top-3 md:right-3',
          copied
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:opacity-100'
        )}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check
            className="animate-in zoom-in-75 size-4 duration-200 motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Copy
            className="size-4 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
        )}
      </Button>
      <SyntaxHighlighter
        {...rest}
        style={resolvedTheme === 'dark' ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={CODE_BLOCK_CUSTOM_STYLE}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
})

const markdownComponents = {
  code(props: HighlightCodeProps) {
    const { children, className, ref, ...rest } = props
    const match = LANGUAGE_REGEX.exec(className || '')

    if (!match) {
      return (
        <InlineCode ref={ref} {...rest} className={className}>
          {children}
        </InlineCode>
      )
    }

    return (
      <CodeBlock
        {...rest}
        code={String(children).replace(TRAILING_NEWLINE_REGEX, '')}
        language={match[1]}
      />
    )
  },
  pre({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
    return <pre {...props}>{children}</pre>
  }
}

export const Markdown = memo(function Markdown({
  className,
  children
}: MarkdownProps): React.JSX.Element {
  return (
    <div
      className={cn(
        styles.markdown,
        'prose dark:prose-invert max-w-full break-words',
        'prose-p:leading-relaxed prose-li:leading-relaxed',
        'prose-headings:tracking-tight prose-headings:font-display',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-blockquote:border-primary/30 prose-blockquote:not-italic prose-blockquote:font-serif',
        '[&_.katex]{font-size:1em;}',
        'prose-img:max-w-full',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPluginList}
        rehypePlugins={rehypePluginList}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
})
