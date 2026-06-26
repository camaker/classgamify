import { CustomerPortalButton } from '@/components/pricing/customer-portal-button';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/auth/client';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { useCurrentPlan } from '@/hooks/use-payment';
import { getPricePlans } from '@/lib/price-plan';
import {
  buildSettingsBillingCardViewModel,
  type SettingsBillingCardActionKind,
  type SettingsBillingCardBadge,
  type SettingsBillingCardPeriodRow,
} from '@/payment/billing-view';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';
import { IconCircleCheck, IconClock, IconRefresh } from '@tabler/icons-react';
import { useCallback } from 'react';
/** Card container: full width, no bottom padding */
const cardClass = cn('w-full overflow-hidden pt-6 pb-0 flex flex-col');
/** Footer: right-aligned primary action, muted background */
const footerClass = cn(
  'mt-2 px-6 py-4 flex justify-end items-center bg-muted rounded-none'
);
/**
 * Billing card: current plan and subscription status
 */
export function BillingCard() {
  const { data: session, isPending: isLoadingSession } =
    authClient.useSession();
  const currentUser = session?.user;
  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    error: loadPaymentError,
    refetch: refetchPayment,
  } = useCurrentPlan(!!currentUser?.id);
  const currentPlan = paymentData?.currentPlan ?? null;
  const subscription = paymentData?.subscription ?? null;
  const plansRecord = getPricePlans();
  const plans = Object.values(plansRecord);
  const handleRetry = useCallback(() => refetchPayment(), [refetchPayment]);
  const view = buildSettingsBillingCardViewModel({
    canManageBilling: Boolean(currentUser),
    currentPlan,
    formatDate,
    hasLoadError: Boolean(loadPaymentError),
    isLoading: isLoadingPayment || isLoadingSession,
    plans,
    subscription,
  });

  if (view.state === 'loading') {
    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {view.header.title}
          </CardTitle>
          <CardDescription>{view.header.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="flex items-center justify-start space-x-4">
            <Skeleton className="h-8 w-1/5" />
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <Skeleton className="h-6 w-3/5" />
          </div>
        </CardContent>
        <CardFooter className={footerClass}>
          <Skeleton className="h-8 w-1/4" />
        </CardFooter>
      </Card>
    );
  }

  if (view.state === 'error') {
    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {view.header.title}
          </CardTitle>
          <CardDescription>{view.header.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="text-destructive text-sm">{view.message}</div>
        </CardContent>
        <CardFooter className={footerClass}>
          <Button variant="outline" onClick={handleRetry}>
            <IconRefresh className="size-4 mr-1" />
            {view.action?.label}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (view.state === 'no-plan') {
    return (
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {view.header.title}
          </CardTitle>
          <CardDescription>{view.header.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{view.message}</div>
        </CardContent>
        <CardFooter className={footerClass}>
          <BillingCardAction action={view.action} onRetry={handleRetry} />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {view.header.title}
        </CardTitle>
        <CardDescription>{view.header.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex items-center justify-start space-x-4">
          <div className="text-3xl font-medium">{view.plan?.name}</div>
          {view.statusBadge && <BillingStatusBadge badge={view.statusBadge} />}
        </div>

        {view.plan?.message && (
          <div className="text-sm text-muted-foreground">
            {view.plan.message}
          </div>
        )}

        {view.periodRows.length > 0 && (
          <div className="text-sm text-muted-foreground space-y-2">
            {view.periodRows.map((row) => (
              <BillingPeriodRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className={footerClass}>
        <BillingCardAction action={view.action} onRetry={handleRetry} />
      </CardFooter>
    </Card>
  );
}

function BillingStatusBadge({ badge }: { badge: SettingsBillingCardBadge }) {
  const Icon = badge.icon === 'clock' ? IconClock : IconCircleCheck;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs border-transparent',
        badge.tone === 'trial'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
      )}
    >
      <span className="flex items-center space-x-2">
        <Icon className="size-3 mr-1" />
        {badge.label}
      </span>
    </Badge>
  );
}

function BillingPeriodRow({ row }: { row: SettingsBillingCardPeriodRow }) {
  return (
    <div
      className={cn(
        row.tone === 'warning' ? 'text-amber-600' : 'text-muted-foreground'
      )}
    >
      {row.label} {row.value}
      {row.suffix && ` ${row.suffix}`}
    </div>
  );
}

function BillingCardAction({
  action,
  onRetry,
}: {
  action?: {
    kind: SettingsBillingCardActionKind;
    label: string;
  };
  onRetry: () => void;
}) {
  if (!action) return null;

  if (action.kind === 'retry') {
    return (
      <Button variant="outline" onClick={onRetry}>
        <IconRefresh className="size-4 mr-1" />
        {action.label}
      </Button>
    );
  }

  if (action.kind === 'upgrade') {
    return (
      <Link
        to={Routes.Pricing}
        className={buttonVariants({ variant: 'default' })}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <CustomerPortalButton returnUrl={undefined}>
      {action.label}
    </CustomerPortalButton>
  );
}
