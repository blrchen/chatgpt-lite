import { Separator } from '@/components/ui/separator'

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center text-center">
      <div className="flex items-center gap-3 text-lg font-medium">
        <h2>404</h2>
        <Separator orientation="vertical" className="h-6" />
        This page could not be found.
      </div>
    </div>
  )
}

export default NotFound
