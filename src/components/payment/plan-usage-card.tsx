import { buttonVariants } from '@/components/ui/button';
import { usePlanUsage } from '@/hooks/use-plan-usage';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  buildPlanUsageCardView,
  type PlanUsageMeterView,
} from '@/payment/plan-usage-view';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

/**
 * Plan usage for the signed-in teacher: what is counted, how much is left,
 * and how to get more. Shows nothing until usage has loaded so it never
 * flashes wrong numbers.
 */
export function PlanUsageCard({ className }: { className?: string }) {
  const { data } = usePlanUsage();
  if (!data) return null;

  const view = buildPlanUsageCardView(data);
  const headingId = 'plan-usage-heading';

  return (
    <section
      aria-labelledby={headingId}
      data-testid="plan-usage-card"
      className={cn('rounded-lg border bg-card p-4', className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="font-semibold text-base">
            {view.title}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">{view.planLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {view.manageBillingLabel ? (
            <Link
              to={Routes.SettingsBilling}
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
            >
              {view.manageBillingLabel}
            </Link>
          ) : null}
          {view.showUpgrade ? (
            <Link
              to={Routes.Pricing}
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
            >
              {view.upgradeLabel}
            </Link>
          ) : null}
        </div>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {view.meters.map((meter) => (
          <PlanUsageMeter key={meter.kind} meter={meter} />
        ))}
      </ul>
      <p className="mt-4 text-muted-foreground text-sm leading-6">
        {view.note}
      </p>
    </section>
  );
}

function PlanUsageMeter({ meter }: { meter: PlanUsageMeterView }) {
  return (
    <li className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{meter.label}</span>
        <span className="tabular-nums text-muted-foreground">
          {meter.value}
        </span>
      </div>
      {meter.limit !== null ? (
        <meter
          aria-label={meter.ariaLabel}
          className="mt-2 block h-2 w-full"
          high={Math.max(1, Math.ceil(meter.limit * 0.8))}
          low={1}
          max={meter.limit}
          min={0}
          optimum={0}
          value={Math.min(meter.used, meter.limit)}
        />
      ) : (
        <span className="sr-only">{meter.ariaLabel}</span>
      )}
      {meter.statusLabel ? (
        <p
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            meter.status === 'reached'
              ? 'text-destructive'
              : 'text-amber-700 dark:text-amber-400'
          )}
        >
          {meter.status === 'reached' ? (
            <IconAlertTriangle aria-hidden="true" className="size-3.5" />
          ) : (
            <IconCircleCheck aria-hidden="true" className="size-3.5" />
          )}
          {meter.statusLabel}
        </p>
      ) : null}
    </li>
  );
}
