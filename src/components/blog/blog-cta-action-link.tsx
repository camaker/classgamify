import type { BlogCtaAction, BlogCtaActionIcon } from '@/pages/blog-page-view';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type BlogCtaActionLinkProps = {
  action: BlogCtaAction;
};

export function BlogCtaActionLink({ action }: BlogCtaActionLinkProps) {
  const Icon = blogCtaActionIcons[action.icon];

  return (
    <Link
      to={action.to}
      className={cn(
        buttonVariants(
          action.variant === 'outline' ? { variant: 'outline' } : undefined
        )
      )}
    >
      <Icon className="size-4" />
      {action.label}
    </Link>
  );
}

const blogCtaActionIcons = {
  create: IconPlus,
  preview: IconDeviceGamepad2,
  templates: IconLayoutGrid,
} satisfies Record<BlogCtaActionIcon, TablerIcon>;
