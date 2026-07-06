import { m } from '@/locale/paraglide/messages';
import {
  PAYMENT_MAX_POLL_TIME,
  PAYMENT_POLL_INTERVAL,
} from '@/payment/constants';

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
  handoffView: PaymentStatusHandoffView;
  icon: PaymentStatusIconKey;
  nextStep: PaymentStatusNextStepView;
  title: string;
  tone: PaymentStatusTone;
};

export const PAYMENT_STATUS_HANDOFF_ITEM_IDS = [
  'workspace-scope',
  'route-gate',
  'status',
  'status-tone',
  'status-icon',
  'session-id-presence',
  'session-id-privacy',
  'hosted-checkout',
  'payment-polling',
  'poll-interval',
  'poll-timeout',
  'completion-check',
  'current-plan-cache',
  'redirect-callback',
  'callback-normalization',
  'billing-return',
  'pricing-retry',
  'timeout-recovery',
  'activity-access',
  'assignment-access',
  'ai-draft-access',
  'result-access',
  'source-material-access',
  'assignment-snapshot-boundary',
  'assignment-link-boundary',
  'student-attempt-boundary',
  'student-data-boundary',
  'provider-secret-boundary',
  'raw-session-boundary',
  'privacy-guard',
] as const;

export type PaymentStatusHandoffItemId =
  (typeof PAYMENT_STATUS_HANDOFF_ITEM_IDS)[number];

export type PaymentStatusHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PaymentStatusHandoffItemId;
  label: string;
  value: string;
};

export type PaymentStatusHandoffPrivacyContract = {
  changesActivityContent: false;
  changesAssignmentLinks: false;
  exposesActivityContent: false;
  exposesPaymentProviderSecrets: false;
  exposesRawCheckoutSession: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswers: false;
  exposesStudentIdentifiers: false;
  exposesTeacherEmail: false;
  hostedCheckoutStatusOnly: true;
  itemIds: PaymentStatusHandoffItemId[];
  modifiesAssignmentSnapshots: false;
  refreshesPlanCacheOnlyAfterSuccess: true;
  scope: 'teacher-payment-callback';
};

export type PaymentStatusHandoffView = {
  description: string;
  itemViews: PaymentStatusHandoffItemView[];
  privacy: PaymentStatusHandoffPrivacyContract;
  title: string;
};

export type PaymentStatusHandoffSource = Pick<
  PaymentStatusView,
  'icon' | 'title' | 'tone'
> & {
  hasSessionId: boolean;
  status: PaymentConfirmationStatus;
};

export function getInitialPaymentConfirmationStatus(
  sessionId: string | undefined
): PaymentConfirmationStatus {
  return sessionId ? 'processing' : 'failed';
}

export function buildPaymentStatusView(
  status: PaymentConfirmationStatus,
  options: { hasSessionId?: boolean } = {}
): PaymentStatusView {
  const hasSessionId = options.hasSessionId ?? status === 'processing';

  switch (status) {
    case 'processing': {
      const view = {
        description: m.settings_payment_processing_description(),
        icon: 'loader',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_processing_next_step_description(),
          label: m.settings_payment_processing_next_step_label(),
        }),
        title: m.settings_payment_processing_title(),
        tone: 'working',
      } satisfies Omit<PaymentStatusView, 'handoffView'>;

      return buildPaymentStatusViewWithHandoff({
        ...view,
        hasSessionId,
        status,
      });
    }
    case 'success': {
      const view = {
        description: m.settings_payment_success_description(),
        icon: 'check',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_success_next_step_description(),
          label: m.settings_payment_success_next_step_label(),
        }),
        title: m.settings_payment_success_title(),
        tone: 'success',
      } satisfies Omit<PaymentStatusView, 'handoffView'>;

      return buildPaymentStatusViewWithHandoff({
        ...view,
        hasSessionId,
        status,
      });
    }
    case 'failed': {
      const view = {
        description: m.settings_payment_failed_description(),
        icon: 'x',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_failed_next_step_description(),
          label: m.settings_payment_failed_next_step_label(),
        }),
        title: m.settings_payment_failed_title(),
        tone: 'danger',
      } satisfies Omit<PaymentStatusView, 'handoffView'>;

      return buildPaymentStatusViewWithHandoff({
        ...view,
        hasSessionId,
        status,
      });
    }
    case 'timeout': {
      const view = {
        description: m.settings_payment_timeout_description(),
        icon: 'alert',
        nextStep: buildPaymentStatusNextStepView({
          description: m.settings_payment_timeout_next_step_description(),
          label: m.settings_payment_timeout_next_step_label(),
        }),
        title: m.settings_payment_timeout_title(),
        tone: 'warning',
      } satisfies Omit<PaymentStatusView, 'handoffView'>;

      return buildPaymentStatusViewWithHandoff({
        ...view,
        hasSessionId,
        status,
      });
    }
  }
}

export function buildPaymentStatusHandoffView(
  source: PaymentStatusHandoffSource
): PaymentStatusHandoffView {
  const itemViews = PAYMENT_STATUS_HANDOFF_ITEM_IDS.map((id) =>
    buildPaymentStatusHandoffItemView({ ...source, id })
  );

  return {
    description: m.settings_payment_handoff_description(),
    itemViews,
    privacy: buildPaymentStatusHandoffPrivacyContract(itemViews),
    title: m.settings_payment_handoff_title(),
  };
}

function buildPaymentStatusViewWithHandoff({
  description,
  hasSessionId,
  icon,
  nextStep,
  status,
  title,
  tone,
}: Omit<PaymentStatusView, 'handoffView'> & {
  hasSessionId: boolean;
  status: PaymentConfirmationStatus;
}): PaymentStatusView {
  return {
    description,
    handoffView: buildPaymentStatusHandoffView({
      hasSessionId,
      icon,
      status,
      title,
      tone,
    }),
    icon,
    nextStep,
    title,
    tone,
  };
}

function buildPaymentStatusHandoffItemView({
  id,
  ...source
}: PaymentStatusHandoffSource & {
  id: PaymentStatusHandoffItemId;
}): PaymentStatusHandoffItemView {
  const label = getPaymentStatusHandoffItemLabel(id);
  const description = getPaymentStatusHandoffItemDescription(id);
  const value = getPaymentStatusHandoffItemValue({ ...source, id });

  return {
    ariaLabel: m.settings_payment_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function getPaymentStatusHandoffItemLabel(id: PaymentStatusHandoffItemId) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_payment_handoff_workspace_scope_label();
    case 'route-gate':
      return m.settings_payment_handoff_route_gate_label();
    case 'status':
      return m.settings_payment_handoff_status_label();
    case 'status-tone':
      return m.settings_payment_handoff_status_tone_label();
    case 'status-icon':
      return m.settings_payment_handoff_status_icon_label();
    case 'session-id-presence':
      return m.settings_payment_handoff_session_id_presence_label();
    case 'session-id-privacy':
      return m.settings_payment_handoff_session_id_privacy_label();
    case 'hosted-checkout':
      return m.settings_payment_handoff_hosted_checkout_label();
    case 'payment-polling':
      return m.settings_payment_handoff_payment_polling_label();
    case 'poll-interval':
      return m.settings_payment_handoff_poll_interval_label();
    case 'poll-timeout':
      return m.settings_payment_handoff_poll_timeout_label();
    case 'completion-check':
      return m.settings_payment_handoff_completion_check_label();
    case 'current-plan-cache':
      return m.settings_payment_handoff_current_plan_cache_label();
    case 'redirect-callback':
      return m.settings_payment_handoff_redirect_callback_label();
    case 'callback-normalization':
      return m.settings_payment_handoff_callback_normalization_label();
    case 'billing-return':
      return m.settings_payment_handoff_billing_return_label();
    case 'pricing-retry':
      return m.settings_payment_handoff_pricing_retry_label();
    case 'timeout-recovery':
      return m.settings_payment_handoff_timeout_recovery_label();
    case 'activity-access':
      return m.settings_payment_handoff_activity_access_label();
    case 'assignment-access':
      return m.settings_payment_handoff_assignment_access_label();
    case 'ai-draft-access':
      return m.settings_payment_handoff_ai_draft_access_label();
    case 'result-access':
      return m.settings_payment_handoff_result_access_label();
    case 'source-material-access':
      return m.settings_payment_handoff_source_material_access_label();
    case 'assignment-snapshot-boundary':
      return m.settings_payment_handoff_assignment_snapshot_boundary_label();
    case 'assignment-link-boundary':
      return m.settings_payment_handoff_assignment_link_boundary_label();
    case 'student-attempt-boundary':
      return m.settings_payment_handoff_student_attempt_boundary_label();
    case 'student-data-boundary':
      return m.settings_payment_handoff_student_data_boundary_label();
    case 'provider-secret-boundary':
      return m.settings_payment_handoff_provider_secret_boundary_label();
    case 'raw-session-boundary':
      return m.settings_payment_handoff_raw_session_boundary_label();
    case 'privacy-guard':
      return m.settings_payment_handoff_privacy_guard_label();
  }
}

function getPaymentStatusHandoffItemDescription(
  id: PaymentStatusHandoffItemId
) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_payment_handoff_workspace_scope_description();
    case 'route-gate':
      return m.settings_payment_handoff_route_gate_description();
    case 'status':
      return m.settings_payment_handoff_status_description();
    case 'status-tone':
      return m.settings_payment_handoff_status_tone_description();
    case 'status-icon':
      return m.settings_payment_handoff_status_icon_description();
    case 'session-id-presence':
      return m.settings_payment_handoff_session_id_presence_description();
    case 'session-id-privacy':
      return m.settings_payment_handoff_session_id_privacy_description();
    case 'hosted-checkout':
      return m.settings_payment_handoff_hosted_checkout_description();
    case 'payment-polling':
      return m.settings_payment_handoff_payment_polling_description();
    case 'poll-interval':
      return m.settings_payment_handoff_poll_interval_description();
    case 'poll-timeout':
      return m.settings_payment_handoff_poll_timeout_description();
    case 'completion-check':
      return m.settings_payment_handoff_completion_check_description();
    case 'current-plan-cache':
      return m.settings_payment_handoff_current_plan_cache_description();
    case 'redirect-callback':
      return m.settings_payment_handoff_redirect_callback_description();
    case 'callback-normalization':
      return m.settings_payment_handoff_callback_normalization_description();
    case 'billing-return':
      return m.settings_payment_handoff_billing_return_description();
    case 'pricing-retry':
      return m.settings_payment_handoff_pricing_retry_description();
    case 'timeout-recovery':
      return m.settings_payment_handoff_timeout_recovery_description();
    case 'activity-access':
      return m.settings_payment_handoff_activity_access_description();
    case 'assignment-access':
      return m.settings_payment_handoff_assignment_access_description();
    case 'ai-draft-access':
      return m.settings_payment_handoff_ai_draft_access_description();
    case 'result-access':
      return m.settings_payment_handoff_result_access_description();
    case 'source-material-access':
      return m.settings_payment_handoff_source_material_access_description();
    case 'assignment-snapshot-boundary':
      return m.settings_payment_handoff_assignment_snapshot_boundary_description();
    case 'assignment-link-boundary':
      return m.settings_payment_handoff_assignment_link_boundary_description();
    case 'student-attempt-boundary':
      return m.settings_payment_handoff_student_attempt_boundary_description();
    case 'student-data-boundary':
      return m.settings_payment_handoff_student_data_boundary_description();
    case 'provider-secret-boundary':
      return m.settings_payment_handoff_provider_secret_boundary_description();
    case 'raw-session-boundary':
      return m.settings_payment_handoff_raw_session_boundary_description();
    case 'privacy-guard':
      return m.settings_payment_handoff_privacy_guard_description();
  }
}

function getPaymentStatusHandoffItemValue({
  hasSessionId,
  icon,
  id,
  status,
  title,
  tone,
}: PaymentStatusHandoffSource & {
  id: PaymentStatusHandoffItemId;
}) {
  switch (id) {
    case 'workspace-scope':
      return m.settings_payment_handoff_workspace_scope_value();
    case 'route-gate':
      return m.settings_payment_handoff_route_gate_value();
    case 'status':
      return title;
    case 'status-tone':
      return getPaymentStatusHandoffToneValue(tone);
    case 'status-icon':
      return getPaymentStatusHandoffIconValue(icon);
    case 'session-id-presence':
      return hasSessionId
        ? m.settings_payment_handoff_session_present_value()
        : m.settings_payment_handoff_session_missing_value();
    case 'session-id-privacy':
      return m.settings_payment_handoff_session_id_privacy_value();
    case 'hosted-checkout':
      return m.settings_payment_handoff_hosted_checkout_value();
    case 'payment-polling':
      return status === 'processing'
        ? m.settings_payment_handoff_polling_active_value()
        : m.settings_payment_handoff_polling_complete_value();
    case 'poll-interval':
      return m.settings_payment_handoff_poll_interval_value({
        seconds: millisecondsToSeconds(PAYMENT_POLL_INTERVAL),
      });
    case 'poll-timeout':
      return m.settings_payment_handoff_poll_timeout_value({
        seconds: millisecondsToSeconds(PAYMENT_MAX_POLL_TIME),
      });
    case 'completion-check':
      return m.settings_payment_handoff_completion_check_value();
    case 'current-plan-cache':
      return status === 'success'
        ? m.settings_payment_handoff_current_plan_cache_success_value()
        : m.settings_payment_handoff_current_plan_cache_waiting_value();
    case 'redirect-callback':
      return status === 'success'
        ? m.settings_payment_handoff_redirect_ready_value()
        : m.settings_payment_handoff_redirect_waiting_value();
    case 'callback-normalization':
      return m.settings_payment_handoff_callback_normalization_value();
    case 'billing-return':
      return m.settings_payment_handoff_billing_return_value();
    case 'pricing-retry':
      return status === 'failed'
        ? m.settings_payment_handoff_pricing_retry_ready_value()
        : m.settings_payment_handoff_pricing_retry_waiting_value();
    case 'timeout-recovery':
      return status === 'timeout'
        ? m.settings_payment_handoff_timeout_recovery_ready_value()
        : m.settings_payment_handoff_timeout_recovery_waiting_value();
    case 'activity-access':
      return m.settings_payment_handoff_activity_access_value();
    case 'assignment-access':
      return m.settings_payment_handoff_assignment_access_value();
    case 'ai-draft-access':
      return m.settings_payment_handoff_ai_draft_access_value();
    case 'result-access':
      return m.settings_payment_handoff_result_access_value();
    case 'source-material-access':
      return m.settings_payment_handoff_source_material_access_value();
    case 'assignment-snapshot-boundary':
      return m.settings_payment_handoff_assignment_snapshot_boundary_value();
    case 'assignment-link-boundary':
      return m.settings_payment_handoff_assignment_link_boundary_value();
    case 'student-attempt-boundary':
      return m.settings_payment_handoff_student_attempt_boundary_value();
    case 'student-data-boundary':
      return m.settings_payment_handoff_student_data_boundary_value();
    case 'provider-secret-boundary':
      return m.settings_payment_handoff_provider_secret_boundary_value();
    case 'raw-session-boundary':
      return m.settings_payment_handoff_raw_session_boundary_value();
    case 'privacy-guard':
      return m.settings_payment_handoff_privacy_guard_value();
  }
}

function getPaymentStatusHandoffToneValue(tone: PaymentStatusTone) {
  switch (tone) {
    case 'danger':
      return m.settings_payment_handoff_tone_danger_value();
    case 'success':
      return m.settings_payment_handoff_tone_success_value();
    case 'warning':
      return m.settings_payment_handoff_tone_warning_value();
    case 'working':
      return m.settings_payment_handoff_tone_working_value();
  }
}

function getPaymentStatusHandoffIconValue(icon: PaymentStatusIconKey) {
  switch (icon) {
    case 'alert':
      return m.settings_payment_handoff_icon_alert_value();
    case 'check':
      return m.settings_payment_handoff_icon_check_value();
    case 'loader':
      return m.settings_payment_handoff_icon_loader_value();
    case 'x':
      return m.settings_payment_handoff_icon_x_value();
  }
}

function buildPaymentStatusHandoffPrivacyContract(
  itemViews: PaymentStatusHandoffItemView[]
): PaymentStatusHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesPaymentProviderSecrets: false,
    exposesRawCheckoutSession: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesStudentIdentifiers: false,
    exposesTeacherEmail: false,
    hostedCheckoutStatusOnly: true,
    itemIds: itemViews.map((item) => item.id),
    modifiesAssignmentSnapshots: false,
    refreshesPlanCacheOnlyAfterSuccess: true,
    scope: 'teacher-payment-callback',
  };
}

function millisecondsToSeconds(value: number) {
  return Math.round(value / 1000);
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
