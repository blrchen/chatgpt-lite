'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AppButton } from '@/components/common/app-button'
import { StatusPageShell } from '@/components/common/status-page-shell'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.JSX.Element {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPageShell
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or return to the chat."
      illustration={
        <>
          <div className="text-primary/15 font-serif text-6xl select-none motion-reduce:transform-none md:text-7xl">
            ❧
          </div>
          <div className="bg-primary/5 absolute inset-0 -z-10 scale-150 rounded-full blur-3xl motion-reduce:hidden" />
        </>
      }
      actions={
        <>
          <AppButton onClick={reset} variant="outline" className="rounded-xl px-6 hover:shadow-md">
            Try again
          </AppButton>
          <AppButton asChild className="rounded-xl px-6 hover:shadow-md">
            <Link href="/chat">Return to chat</Link>
          </AppButton>
        </>
      }
    />
  )
}
