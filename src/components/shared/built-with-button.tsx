import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

export default function BuiltWithButton() {
  return (
    <Link
      to={Routes.Root}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 py-4 rounded-md gap-2'
      )}
    >
      <span>ClassGamify</span>
      <span className="font-semibold">Activity</span>
    </Link>
  );
}
