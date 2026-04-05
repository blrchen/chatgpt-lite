'use client'

import './globals.css'

import { useEffect } from 'react'
import { SkipToContentLink } from '@/components/accessibility/skip-to-content-link'
import { AppButton } from '@/components/common/app-button'
import { StatusPageShell } from '@/components/common/status-page-shell'

import { appFontClassName } from './fonts'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className={`${appFontClassName} h-full`}>
      <body className="h-dvh overflow-hidden text-sm antialiased">
        <SkipToContentLink />
        <main id="main-content" className="flex min-h-dvh flex-col">
          <StatusPageShell
            title="Something went wrong"
            description="A critical error occurred. Please try again."
            className="min-h-dvh"
            descriptionClassName="text-center not-italic"
            actions={
              <AppButton
                type="button"
                variant="outline"
                onClick={reset}
                className="rounded-xl px-6"
              >
                Try again
              </AppButton>
            }
          />
        </main>
      </body>
    </html>
  )
}
