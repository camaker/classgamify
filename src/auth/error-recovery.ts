import { m } from '@/locale/paraglide/messages';

export const AUTH_ERROR_RECOVERY_STEP_IDS = [
  'retry-sign-in',
  'check-email',
  'protect-workspace',
] as const;

export type AuthErrorRecoveryStepId =
  (typeof AUTH_ERROR_RECOVERY_STEP_IDS)[number];

export type AuthErrorDisplaySource = 'fallback' | 'known-code';

export type AuthErrorDisplayView = {
  message: string;
  source: AuthErrorDisplaySource;
};

export type AuthErrorRecoveryStepView = {
  description: string;
  id: AuthErrorRecoveryStepId;
  title: string;
};

export type AuthErrorRecoveryView = {
  description: string;
  message: AuthErrorDisplayView;
  messageLabel: string;
  steps: AuthErrorRecoveryStepView[];
  stepsTitle: string;
  title: string;
};

export function buildAuthErrorDisplayView(
  knownMessage: string | undefined
): AuthErrorDisplayView {
  const message = knownMessage?.trim();

  if (message) {
    return {
      message,
      source: 'known-code',
    };
  }

  return {
    message: m.auth_error_workspace_unknown_message(),
    source: 'fallback',
  };
}

export function buildAuthErrorRecoveryView({
  knownMessage,
}: {
  knownMessage?: string;
} = {}): AuthErrorRecoveryView {
  return {
    description: m.auth_error_workspace_description(),
    message: buildAuthErrorDisplayView(knownMessage),
    messageLabel: m.auth_error_workspace_message_label(),
    steps: [
      {
        description: m.auth_error_recovery_retry_sign_in_description(),
        id: 'retry-sign-in',
        title: m.auth_error_recovery_retry_sign_in_title(),
      },
      {
        description: m.auth_error_recovery_check_email_description(),
        id: 'check-email',
        title: m.auth_error_recovery_check_email_title(),
      },
      {
        description: m.auth_error_recovery_protect_workspace_description(),
        id: 'protect-workspace',
        title: m.auth_error_recovery_protect_workspace_title(),
      },
    ],
    stepsTitle: m.auth_error_recovery_steps_title(),
    title: m.auth_error_workspace_title(),
  };
}
