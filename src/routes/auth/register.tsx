import { m } from '@/locale/paraglide/messages';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { RegisterForm } from '@/components/auth/register-form';
import { authClient } from '@/auth/client';
import { guestRouteMiddleware } from '@/middlewares/guest-middleware';
import { websiteConfig } from '@/config/website';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale, getSafeCallbackPath } from '@/lib/urls';

export const Route = createFileRoute('/auth/register')({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl:
      typeof search.callbackUrl === 'string' ? search.callbackUrl : undefined,
  }),
  beforeLoad: async ({ search }) => {
    if (!websiteConfig.auth?.enable) {
      throw redirect({ to: Routes.Root });
    }
    const callbackUrl = getSafeCallbackPath(
      search.callbackUrl,
      getPathWithLocale(DEFAULT_LOGIN_REDIRECT)
    );
    // Client-side navigation: check session via auth client
    if (typeof window !== 'undefined') {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        throw redirect({ to: callbackUrl });
      }
    }
  },
  component: RegisterPage,
  server: {
    // Server-side navigation: check session in server, 302 redirect
    middleware: [guestRouteMiddleware],
  },
  head: () => ({
    meta: [
      { title: m.auth_register_title() },
      { name: 'description', content: m.auth_register_description() },
    ],
  }),
});

function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <RegisterForm />
      <div className="text-balance text-center text-xs text-muted-foreground">
        {m.auth_common_by_clicking_continue()}
        <Link
          to={Routes.TermsOfService}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_terms_of_service()}
        </Link>
        {m.auth_common_and()}
        <Link
          to={Routes.PrivacyPolicy}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_privacy_policy()}
        </Link>
      </div>
    </div>
  );
}
