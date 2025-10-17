import { Separator } from '@/components/ui/separator'

const NotFound = () => {
  return (
    <div className="flex flex-1 justify-center">
      <div className="flex gap-3">
        <h2>404</h2>
        <Separator />
        This page could not be found.
      </div>
    </div>
  )
}

export default NotFound
