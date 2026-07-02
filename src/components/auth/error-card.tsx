import { getAuthErrorMessages } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { AuthCard } from '@/components/auth/auth-card';
import { buildAuthErrorRecoveryView } from '@/auth/error-recovery';
import { buildAuthWorkspaceBoundaryView } from '@/auth/workspace-boundary';
import { Routes } from '@/lib/routes';
import { getSafeCallbackPath } from '@/lib/urls';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';

function getKnownAuthErrorMessage(
  errorCode: string | undefined
): string | undefined {
  const authErrorMessages = getAuthErrorMessages();
  const normalizedCode = errorCode?.toLowerCase();

  if (errorCode && authErrorMessages[errorCode]) {
    return authErrorMessages[errorCode];
  }
  if (normalizedCode && authErrorMessages[normalizedCode]) {
    return authErrorMessages[normalizedCode];
  }

  return undefined;
}

export function ErrorCard({
  callbackUrl,
  errorCode,
}: {
  callbackUrl?: string;
  errorCode?: string;
} = {}) {
  const recoveryView = buildAuthErrorRecoveryView({
    knownMessage: getKnownAuthErrorMessage(errorCode),
  });
  const safeCallbackUrl = getSafeCallbackPath(callbackUrl, Routes.Create);
  const authSwitchSearch =
    safeCallbackUrl === Routes.Create
      ? undefined
      : { callbackUrl: safeCallbackUrl };

  return (
    <AuthCard
      headerLabel={recoveryView.title}
      description={recoveryView.description}
      workspaceBoundary={buildAuthWorkspaceBoundaryView()}
      bottomButtonHref={Routes.Login}
      bottomButtonLabel={m.auth_error_back_to_login()}
      bottomButtonSearch={authSwitchSearch}
      className="border-none"
    >
      <div className="w-full space-y-4 py-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <IconAlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-destructive"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-destructive">
                {recoveryView.messageLabel}
              </p>
              <p className="text-sm font-medium text-destructive">
                {recoveryView.message.message}
              </p>
            </div>
          </div>
        </div>
        <section
          aria-label={recoveryView.stepsTitle}
          className="rounded-lg border bg-muted/30 p-3"
        >
          <p className="text-xs font-medium text-foreground">
            {recoveryView.stepsTitle}
          </p>
          <ul className="mt-3 space-y-2">
            {recoveryView.steps.map((step) => (
              <li key={step.id} className="flex gap-2">
                <IconCircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-foreground">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AuthCard>
  );
}
