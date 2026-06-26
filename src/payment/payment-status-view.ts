import { m } from '@/locale/paraglide/messages';

export type PaymentConfirmationStatus =
  | 'failed'
  | 'processing'
  | 'success'
  | 'timeout';

export type PaymentStatusIconKey = 'alert' | 'check' | 'loader' | 'x';

export type PaymentStatusTone = 'danger' | 'success' | 'warning' | 'working';

export type PaymentStatusView = {
  description: string;
  icon: PaymentStatusIconKey;
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
        title: m.settings_payment_processing_title(),
        tone: 'working',
      };
    case 'success':
      return {
        description: m.settings_payment_success_description(),
        icon: 'check',
        title: m.settings_payment_success_title(),
        tone: 'success',
      };
    case 'failed':
      return {
        description: m.settings_payment_failed_description(),
        icon: 'x',
        title: m.settings_payment_failed_title(),
        tone: 'danger',
      };
    case 'timeout':
      return {
        description: m.settings_payment_timeout_description(),
        icon: 'alert',
        title: m.settings_payment_timeout_title(),
        tone: 'warning',
      };
  }
}
