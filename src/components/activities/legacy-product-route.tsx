import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import type { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { IconArrowRight, IconDeviceGamepad2 } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type LegacyProductRouteProps = {
  title: string;
  description: string;
  primaryHref: (typeof Routes)[keyof typeof Routes];
  primaryLabel: string;
  secondaryHref: (typeof Routes)[keyof typeof Routes];
  secondaryLabel: string;
};

export function LegacyProductRoute({
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
}: LegacyProductRouteProps) {
  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6 pb-16">
        <Badge variant="outline" className="rounded-md border-primary/30">
          <IconDeviceGamepad2 className="size-3.5" />
          Product reset
        </Badge>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={primaryHref}
            className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
          >
            {primaryLabel}
            <IconArrowRight className="size-4" />
          </Link>
          <Link
            to={secondaryHref}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'rounded-lg bg-background'
            )}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </Container>
  );
}
