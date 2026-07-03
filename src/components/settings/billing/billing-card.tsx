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
  type SettingsBillingCardNextStepView,
  type SettingsBillingCardPlanFeatureSection,
  type SettingsBillingCardPeriodRow,
} from '@/payment/billing-view';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';
import {
  IconCircleCheck,
  IconClock,
  IconListCheck,
  IconRefresh,
} from '@tabler/icons-react';
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
      <Card aria-label={view.ariaLabel} className={cardClass}>
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
      <Card aria-label={view.ariaLabel} className={cardClass}>
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
          <Button
            aria-label={view.action?.ariaLabel}
            variant="outline"
            onClick={handleRetry}
          >
            <IconRefresh className="size-4 mr-1" />
            {view.action?.label}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (view.state === 'no-plan') {
    return (
      <Card aria-label={view.ariaLabel} className={cardClass}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {view.header.title}
          </CardTitle>
          <CardDescription>{view.header.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{view.message}</p>
            {view.nextStep ? (
              <BillingNextStepView nextStep={view.nextStep} />
            ) : null}
          </div>
        </CardContent>
        <CardFooter className={footerClass}>
          <BillingCardAction action={view.action} onRetry={handleRetry} />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card aria-label={view.ariaLabel} className={cardClass}>
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

        {view.plan?.description ? (
          <div className="text-sm text-muted-foreground">
            {view.plan.description}
          </div>
        ) : null}

        {view.plan ? (
          <BillingPlanFeatureSections sections={view.plan.featureSections} />
        ) : null}

        {view.plan?.nextStep ? (
          <BillingNextStepView nextStep={view.plan.nextStep} />
        ) : null}

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

function BillingPlanFeatureSections({
  sections,
}: {
  sections: SettingsBillingCardPlanFeatureSection[];
}) {
  if (sections.length === 0) return null;

  return (
    <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
      {sections.map((section) => (
        <section
          aria-label={section.ariaLabel}
          className="min-w-0 space-y-2"
          key={section.id}
        >
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{section.title}</h3>
            <p className="text-muted-foreground text-xs leading-5">
              {section.description}
            </p>
          </div>
          <ul className="grid gap-2">
            {section.items.map((item) => (
              <li
                aria-label={item.ariaLabel}
                className="flex min-w-0 items-start gap-2 text-sm"
                key={item.id}
              >
                <IconListCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="min-w-0 text-muted-foreground">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function BillingNextStepView({
  nextStep,
}: {
  nextStep: SettingsBillingCardNextStepView;
}) {
  return (
    <section aria-label={nextStep.ariaLabel} className="border-t pt-4 text-sm">
      <p className="font-medium text-foreground">{nextStep.label}</p>
      <p className="mt-1 text-muted-foreground leading-6">
        {nextStep.description}
      </p>
    </section>
  );
}

function BillingStatusBadge({ badge }: { badge: SettingsBillingCardBadge }) {
  const Icon = badge.icon === 'clock' ? IconClock : IconCircleCheck;

  return (
    <Badge
      aria-label={badge.ariaLabel}
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
    <fieldset
      className={cn(
        'm-0 border-0 p-0',
        row.tone === 'warning' ? 'text-amber-600' : 'text-muted-foreground'
      )}
    >
      <legend className="sr-only">{row.ariaLabel}</legend>
      {row.label} {row.value}
      {row.suffix && ` ${row.suffix}`}
    </fieldset>
  );
}

function BillingCardAction({
  action,
  onRetry,
}: {
  action?: {
    ariaLabel: string;
    kind: SettingsBillingCardActionKind;
    label: string;
  };
  onRetry: () => void;
}) {
  if (!action) return null;

  if (action.kind === 'retry') {
    return (
      <Button aria-label={action.ariaLabel} variant="outline" onClick={onRetry}>
        <IconRefresh className="size-4 mr-1" />
        {action.label}
      </Button>
    );
  }

  if (action.kind === 'upgrade') {
    return (
      <Link
        aria-label={action.ariaLabel}
        to={Routes.Pricing}
        className={buttonVariants({ variant: 'default' })}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <CustomerPortalButton ariaLabel={action.ariaLabel} returnUrl={undefined}>
      {action.label}
    </CustomerPortalButton>
  );
}
