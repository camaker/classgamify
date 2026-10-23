import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

/** Inline limit-reached state with the way forward and a plans link. */
export function PlanLimitNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      data-testid="plan-limit-notice"
      className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
    >
      <IconAlertTriangle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
      />
      <div className="min-w-0">
        <p className="leading-6">{message}</p>
        <Link
          to={Routes.Pricing}
          className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline"
        >
          {m.plan_limit_view_plans()}
        </Link>
      </div>
    </div>
  );
}
