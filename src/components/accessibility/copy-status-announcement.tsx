type CopyStatusAnnouncementProps = {
  copied: boolean
  message: string
}

export function CopyStatusAnnouncement({
  copied,
  message
}: CopyStatusAnnouncementProps): React.JSX.Element {
  return (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {copied ? message : ''}
    </span>
  )
}
