import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { parsePlanLimitError } from '@/payment/plan-entitlements';
import { toast } from 'sonner';

/**
 * Shows a plan-limit error as a friendly toast with a "View plans" action, or
 * falls back to the caller's generic failure message for any other error.
 * Returns true when the error was a plan limit.
 */
export function toastPlanLimitOrError(error: unknown, fallbackMessage: string) {
  const planLimit = parsePlanLimitError(error);
  if (!planLimit) {
    toast.error(fallbackMessage);
    return false;
  }

  toast.error(planLimit.message, {
    duration: 12_000,
    action: {
      label: m.plan_limit_view_plans(),
      onClick: () => {
        window.location.assign(getPathWithLocale(Routes.Pricing));
      },
    },
  });
  return true;
}
