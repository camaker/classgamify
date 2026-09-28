import { buildActivityCreatePageEditorViewModel } from '@/activities/editor';
import {
  parseCreateActivityTemplateSearch,
  parseCreateActivityTemplateSourceSearch,
} from '@/activities/template-entry';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import { ActivityPreview } from '@/components/activities/activity-preview';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { buttonVariants } from '@/components/ui/button';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';
import { IconArrowLeft, IconDeviceGamepad2 } from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

/**
 * Signed-in teachers create activities inside the workspace: sidebar,
 * breadcrumbs, and the editor, without the public marketing hero.
 */
export const Route = createFileRoute('/dashboard/activities_/new')({
  validateSearch: (search: Record<string, unknown>) => ({
    source: parseCreateActivityTemplateSourceSearch(search.source),
    template: parseCreateActivityTemplateSearch(search.template),
  }),
  component: NewActivityPage,
});

function NewActivityPage() {
  const { source, template } = Route.useSearch();
  const pageView = useMemo(
    () =>
      buildActivityCreatePageEditorViewModel({
        templateSource: source,
        templateType: template,
      }),
    [source, template]
  );

  return (
    <DashboardLayout
      breadcrumbs={[
        {
          id: 'dashboard',
          label: m.activity_library_breadcrumb_dashboard(),
          href: Routes.Dashboard,
        },
        {
          id: 'activities',
          label: m.activity_library_breadcrumb_current(),
          href: Routes.DashboardActivities,
        },
        {
          id: 'current',
          label: m.activity_new_page_title(),
          isCurrentPage: true,
        },
      ]}
      title={m.activity_new_page_title()}
      description={m.activity_new_page_description()}
    >
      <div className="grid gap-4">
        <Link
          to={Routes.DashboardActivities}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-fit bg-background'
          )}
        >
          <IconArrowLeft className="size-4" />
          {m.activity_edit_page_back_to_library()}
        </Link>
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
          <ActivityCreateForm initialValues={pageView.initialValues} />
          <aside className="space-y-3 2xl:sticky 2xl:top-6 2xl:max-h-[calc(100dvh-3rem)] 2xl:self-start 2xl:overflow-y-auto">
            <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
              <IconDeviceGamepad2 className="size-4 text-primary" />
              {pageView.previewLabel}
            </div>
            <ActivityPreview
              activity={pageView.previewActivity}
              layout="stacked"
              panel={pageView.previewPanel}
            />
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
