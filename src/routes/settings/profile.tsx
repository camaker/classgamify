import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProfileWorkspaceSummary } from '@/components/settings/profile/profile-workspace-summary';
import { UpdateAvatarCard } from '@/components/settings/profile/update-avatar-card';
import { UpdateNameCard } from '@/components/settings/profile/update-name-card';
import { buildSettingsProfilePageViewModel } from '@/settings/profile-view';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const pageView = buildSettingsProfilePageViewModel();

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <div className="flex flex-col gap-8">
        <ProfileWorkspaceSummary view={pageView.workspaceSummaryView} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UpdateNameCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UpdateAvatarCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
