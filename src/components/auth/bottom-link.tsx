import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomLinkProps {
  href: string;
  label: string;
  search?: Record<string, string>;
}

export function BottomLink({ href, label, search }: BottomLinkProps) {
  return (
    <Link
      to={href}
      search={search}
      className={cn(
        buttonVariants({ variant: 'link', size: 'sm' }),
        'font-normal w-full text-muted-foreground hover:underline underline-offset-4 hover:text-primary'
      )}
    >
      {label}
    </Link>
  );
}
