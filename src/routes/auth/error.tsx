import { m } from '@/locale/paraglide/messages';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorCard } from '@/components/auth/error-card';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/auth/error')({
  beforeLoad: () => {
    if (!websiteConfig.auth?.enable) {
      throw redirect({ to: Routes.Root });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl:
      typeof search.callbackUrl === 'string' ? search.callbackUrl : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
    error_description:
      typeof search.error_description === 'string'
        ? search.error_description
        : undefined,
  }),
  component: AuthErrorPage,
  head: () => ({
    meta: [
      { title: m.auth_error_workspace_title() },
      { name: 'description', content: m.auth_error_workspace_description() },
    ],
  }),
});

function AuthErrorPage() {
  const { callbackUrl, error } = Route.useSearch();
  return <ErrorCard callbackUrl={callbackUrl} errorCode={error} />;
}
