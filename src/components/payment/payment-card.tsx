import { checkPaymentCompletion } from '@/api/payment';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PAYMENT_MAX_POLL_TIME,
  PAYMENT_POLL_INTERVAL,
} from '@/payment/constants';
import {
  buildPaymentStatusView,
  getInitialPaymentConfirmationStatus,
  type PaymentConfirmationStatus,
  type PaymentStatusHandoffItemView,
  type PaymentStatusHandoffView,
  type PaymentStatusNextStepView,
  type PaymentStatusIconKey,
  type PaymentStatusTone,
} from '@/payment/payment-status-view';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const paymentStatusToneClass = {
  danger: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  working: 'text-cyan-600',
} satisfies Record<PaymentStatusTone, string>;

function StatusIcon({
  icon,
  tone,
}: {
  icon: PaymentStatusIconKey;
  tone: PaymentStatusTone;
}) {
  const iconClassName = `size-12 shrink-0 ${paymentStatusToneClass[tone]}`;

  switch (icon) {
    case 'loader':
      return <IconLoader2 className={`${iconClassName} animate-spin`} />;
    case 'check':
      return <IconCircleCheck className={iconClassName} />;
    case 'x':
      return <IconCircleX className={iconClassName} />;
    case 'alert':
      return <IconAlertCircle className={iconClassName} />;
  }
}
type PaymentCardProps = {
  sessionId: string | undefined;
  callback?: string;
};
/**
 * Payment result card: polls for completion, shows status, invalidates plan cache and redirects on success.
 */
export function PaymentCard({
  sessionId,
  callback = '/settings/billing',
}: PaymentCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PaymentConfirmationStatus>(() =>
    getInitialPaymentConfirmationStatus(sessionId)
  );
  const pollEndRef = useRef(false);
  const startRef = useRef<number>(0);
  // Poll for payment completion
  useEffect(() => {
    if (!sessionId || status !== 'processing') return;
    pollEndRef.current = false;
    startRef.current = Date.now();
    const poll = async () => {
      while (
        !pollEndRef.current &&
        Date.now() - startRef.current < PAYMENT_MAX_POLL_TIME
      ) {
        try {
          const result = await checkPaymentCompletion({ data: { sessionId } });
          if (result?.isPaid) {
            setStatus('success');
            pollEndRef.current = true;
            return;
          }
        } catch {
          // continue polling
        }
        await new Promise((r) => setTimeout(r, PAYMENT_POLL_INTERVAL));
      }
      if (!pollEndRef.current) setStatus('timeout');
    };
    poll();
  }, [sessionId, status]);
  // On success: invalidate currentPlan then redirect to callback
  useEffect(() => {
    if (status !== 'success' || !callback) return;
    const run = async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
      await queryClient.refetchQueries({ queryKey: ['currentPlan'] });
      navigate({ to: callback });
    };
    run();
  }, [status, callback, queryClient, navigate]);
  const statusView = buildPaymentStatusView(status, {
    hasSessionId: Boolean(sessionId),
  });
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="py-4 text-center">
          <div className="mb-8 flex justify-center">
            <StatusIcon icon={statusView.icon} tone={statusView.tone} />
          </div>
          <CardTitle>{statusView.title}</CardTitle>
          <CardDescription>{statusView.description}</CardDescription>
          <PaymentStatusNextStep nextStep={statusView.nextStep} />
          <PaymentStatusHandoff view={statusView.handoffView} />
        </CardHeader>
      </Card>
    </div>
  );
}

function PaymentStatusNextStep({
  nextStep,
}: {
  nextStep: PaymentStatusNextStepView;
}) {
  return (
    <section
      aria-label={nextStep.ariaLabel}
      className="mt-4 border-t pt-4 text-left text-sm"
    >
      <p className="font-medium text-foreground">{nextStep.label}</p>
      <p className="mt-1 text-muted-foreground leading-6">
        {nextStep.description}
      </p>
    </section>
  );
}

function PaymentStatusHandoff({ view }: { view: PaymentStatusHandoffView }) {
  const titleId = 'settings-payment-callback-handoff-title';
  const descriptionId = 'settings-payment-callback-handoff-description';

  return (
    <section
      aria-label={view.title}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="sr-only"
      data-handoff="settings-payment-callback"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <PaymentStatusHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function PaymentStatusHandoffItem({
  itemView,
}: {
  itemView: PaymentStatusHandoffItemView;
}) {
  const labelId = `settings-payment-callback-handoff-${itemView.id}-label`;
  const valueId = `settings-payment-callback-handoff-${itemView.id}-value`;
  const descriptionId = `settings-payment-callback-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}
