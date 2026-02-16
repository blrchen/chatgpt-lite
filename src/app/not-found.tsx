import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col items-center justify-center px-4 text-center">
      {/* Decorative element with subtle glow */}
      <div className="relative mb-8" aria-hidden="true">
        <div className="text-primary/15 font-serif text-6xl select-none motion-reduce:transform-none md:text-7xl">
          ❧
        </div>
        <div className="bg-primary/5 absolute inset-0 -z-10 scale-150 rounded-full blur-3xl motion-reduce:hidden" />
      </div>

      {/* Error code with dramatic editorial typography */}
      <div className="relative" aria-hidden="true">
        <div className="font-display text-muted-foreground/15 text-[10rem] leading-none font-medium tracking-tighter text-balance select-none md:text-[14rem]">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-primary/25 font-serif text-4xl md:text-5xl">✦</span>
        </div>
      </div>

      {/* Message */}
      <div className="-mt-4 space-y-3">
        <h1 className="text-foreground font-display text-2xl font-medium tracking-tight text-balance md:text-3xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mx-auto max-w-sm font-serif text-sm text-pretty italic">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      {/* Action */}
      <Button
        asChild
        className="mt-10 rounded-xl px-6 transition-transform duration-200 hover:scale-[1.02] hover:shadow-md"
      >
        <Link href="/chat">Return to chat</Link>
      </Button>
    </div>
  )
}
