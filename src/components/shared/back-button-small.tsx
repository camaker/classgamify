import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonSmallProps {
  href?: string
  className?: string
}

export default function BackButtonSmall({
  href,
  className,
}: BackButtonSmallProps) {
  const router = useRouter()

  const button = (
    <Button
      size="sm"
      variant="outline"
      className={cn('size-8 px-0', className)}
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  )

  if (href != null) {
    return <Link to={href}>{button}</Link>
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn('size-8 px-0', className)}
      onClick={() => router.history.back()}
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  )
}
