import { m } from '@/locale/paraglide/messages';

export type PaymentConfirmationStatus =
  | 'failed'
  | 'processing'
  | 'success'
  | 'timeout';

export type PaymentStatusIconKey = 'alert' | 'check' | 'loader' | 'x';

export type PaymentStatusTone = 'danger' | 'success' | 'warning' | 'working';

export type PaymentStatusNextStepView = {
  ariaLabel: string;
  description: string;
  label: string;
};

export type PaymentStatusView = {
  description: string;
  icon: PaymentStatusIconKey;
  nextStep: PaymentStatusNextStepView;
  title: string;
  tone: PaymentStatusTone;
};

export function getInitialPaymentConfirmationStatus(
  sessionId: string | undefined
): PaymentConfirmationStatus {
  return sessionId ? 'processing' : 'failed';
}

export function buildPaymentStatusView(
  status: PaymentConfirmationStatus
): PaymentStatusView {
  switch (status) {
    case 'processing':
      return {
        description: m.settings_payment_processing_description(),
        icon: 'loader',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_processing_next_step_description(),
          label: m.settings_payment_processing_next_step_label(),
        }),
        title: m.settings_payment_processing_title(),
        tone: 'working',
      };
    case 'success':
      return {
        description: m.settings_payment_success_description(),
        icon: 'check',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_success_next_step_description(),
          label: m.settings_payment_success_next_step_label(),
        }),
        title: m.settings_payment_success_title(),
        tone: 'success',
      };
    case 'failed':
      return {
        description: m.settings_payment_failed_description(),
        icon: 'x',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_failed_next_step_description(),
          label: m.settings_payment_failed_next_step_label(),
        }),
        title: m.settings_payment_failed_title(),
        tone: 'danger',
      };
    case 'timeout':
      return {
        description: m.settings_payment_timeout_description(),
        icon: 'alert',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_timeout_next_step_description(),
          label: m.settings_payment_timeout_next_step_label(),
        }),
        title: m.settings_payment_timeout_title(),
        tone: 'warning',
      };
  }
}

function buildPaymentStatusNextStepView({
  description,
  label,
}: {
  description: string;
  label: string;
}): PaymentStatusNextStepView {
  return {
    ariaLabel: m.settings_payment_next_step_aria({ description, label }),
    description,
    label,
  };
}
