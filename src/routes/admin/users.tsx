import { buildAdminUsersPageViewModel } from '@/admin/users-view';
import { createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AdminUsersContent } from '@/components/admin/users/admin-users-content';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const pageView = buildAdminUsersPageViewModel();

  return (
    <>
      <DashboardHeader breadcrumbs={pageView.breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            <section
              aria-label={pageView.contentAriaLabel}
              className="px-4 lg:px-6"
            >
              <AdminUsersContent />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
