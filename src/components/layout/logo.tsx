import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/">
      <img
        src="/logo.png"
        alt="Logo"
        title="Logo"
        width={96}
        height={96}
        className={cn('size-8 rounded-md', className)}
      />
    </Link>
  )
}
