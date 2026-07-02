import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DeleteAccountCard } from '@/components/settings/security/delete-account-card';
import { PasswordCardWrapper } from '@/components/settings/security/password-card-wrapper';
import { SecurityWorkspaceSummary } from '@/components/settings/security/security-workspace-summary';
import { buildSettingsSecurityPageViewModel } from '@/settings/security-view';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/security')({
  component: SecurityPage,
});

function SecurityPage() {
  const pageView = buildSettingsSecurityPageViewModel();

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <div className="flex flex-col gap-8">
        <SecurityWorkspaceSummary view={pageView.workspaceSummaryView} />
        {pageView.credentialLoginEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PasswordCardWrapper />
          </div>
        )}
        {pageView.deleteAccountEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DeleteAccountCard />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
