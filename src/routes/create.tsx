import { ActivityPreview } from '@/components/activities/activity-preview';
import { ActivityCreateForm } from '@/components/activities/activity-create-form';
import { authClient } from '@/auth/client';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { buildActivityCreatePageEditorViewModel } from '@/activities/editor';
import {
  parseCreateActivityTemplateSearch,
  parseCreateActivityTemplateSourceSearch,
} from '@/activities/template-entry';
import { websiteConfig } from '@/config/website';
import { createRouteWorkspaceMiddleware } from '@/middlewares/auth-middleware';
import { Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { IconDeviceGamepad2, IconSparkles } from '@tabler/icons-react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/create')({
  validateSearch: (search: Record<string, unknown>) => ({
    source: parseCreateActivityTemplateSourceSearch(search.source),
    template: parseCreateActivityTemplateSearch(search.template),
  }),
  head: () =>
    seo('/create', {
      title: `${m.create_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.create_page_seo_description(),
    }),
  server: {
    middleware: [createRouteWorkspaceMiddleware],
  },
  component: CreatePage,
});

function CreatePage() {
  const { source, template } = Route.useSearch();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [sessionReady, setSessionReady] = useState(false);
  useEffect(() => setSessionReady(true), []);
  const navigate = useNavigate();
  // Client-side navigations skip the server middleware; send signed-in
  // teachers to the workspace editor here too.
  useEffect(() => {
    if (session?.user) {
      void navigate({
        to: Routes.DashboardActivityNew,
        search: { source, template },
        replace: true,
      });
    }
  }, [navigate, session?.user, source, template]);
  const pageView = useMemo(
    () =>
      buildActivityCreatePageEditorViewModel({
        templateSource: source,
        templateType: template,
      }),
    [source, template]
  );

  return (
    <Container className="px-4 py-8 md:py-10">
      <div className="mx-auto max-w-7xl pb-16">
        <section className="pb-2">
          <div className="grid gap-6">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-md border-primary/30">
                <IconSparkles className="size-3.5" />
                {pageView.hero.badgeLabel}
              </Badge>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                  {pageView.hero.title}
                </h1>
                <p className="max-w-2xl text-muted-foreground text-base leading-7">
                  {pageView.hero.description}
                </p>
              </div>
              {sessionReady && !sessionPending && !session?.user ? (
                <div className="max-w-2xl rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-semibold">
                    {m.create_guest_save_notice_title()}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {m.create_guest_save_notice_description()}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      to={Routes.Register}
                      search={{ callbackUrl: getPathWithLocale(Routes.Create) }}
                      className={cn(
                        buttonVariants({ size: 'sm' }),
                        'rounded-md'
                      )}
                    >
                      {m.create_guest_register_action()}
                    </Link>
                    <Link
                      to={Routes.Login}
                      search={{ callbackUrl: getPathWithLocale(Routes.Create) }}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {m.create_guest_login_action()}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
          <ActivityCreateForm initialValues={pageView.initialValues} />
          <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto xl:pr-1">
            <section className="space-y-3" aria-label={pageView.previewLabel}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <IconDeviceGamepad2 className="size-4 text-primary" />
                {pageView.previewLabel}
              </div>
              <ActivityPreview
                activity={pageView.previewActivity}
                layout="stacked"
                panel={pageView.previewPanel}
              />
            </section>
          </aside>
        </div>
      </div>
    </Container>
  );
}
