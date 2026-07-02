import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FilesPageContent } from '@/components/settings/files/files-page-content';
import { FilesWorkspaceSummary } from '@/components/settings/files/files-workspace-summary';
import {
  buildSettingsFilesPageViewModel,
  isSettingsFilesEnabled,
} from '@/settings/files-view';
import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/files')({
  beforeLoad: () => {
    if (!isSettingsFilesEnabled()) {
      throw notFound({ routeId: rootRouteId });
    }
  },
  component: FilesPage,
});

function FilesPage() {
  const pageView = buildSettingsFilesPageViewModel();

  return (
    <DashboardLayout
      breadcrumbs={pageView.breadcrumbs}
      title={pageView.title}
      description={pageView.description}
    >
      <div className="flex flex-col gap-8">
        <FilesWorkspaceSummary view={pageView.workspaceSummaryView} />
        <FilesPageContent />
      </div>
    </DashboardLayout>
  );
}
