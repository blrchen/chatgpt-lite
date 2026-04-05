import Link from 'next/link'
import { AppButton } from '@/components/common/app-button'
import { StatusPageShell } from '@/components/common/status-page-shell'

export default function NotFound(): React.JSX.Element {
  return (
    <StatusPageShell
      title="Page Not Found"
      description="The page you’re looking for doesn’t exist or has been moved."
      illustration={
        <>
          <div className="text-primary/15 font-serif text-6xl select-none motion-reduce:transform-none md:text-7xl">
            ❧
          </div>
          <div className="bg-primary/8 absolute inset-0 -z-10 scale-150 rounded-full blur-3xl motion-reduce:hidden" />
          <div className="font-display text-muted-foreground/15 mt-2 text-[10rem] leading-none font-medium tracking-tighter text-balance select-none md:text-[14rem]">
            404
          </div>
          <div
            className="absolute inset-0 top-3 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-primary/25 font-serif text-4xl md:text-5xl">✦</span>
          </div>
        </>
      }
      contentClassName="-mt-4"
      actions={
        <AppButton asChild className="rounded-xl px-6 hover:shadow-md">
          <Link href="/chat">Return to Chat</Link>
        </AppButton>
      }
    />
  )
}
