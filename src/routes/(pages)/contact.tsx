import { m } from '@/locale/paraglide/messages';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { getMailtoUrl } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  IconBrandGithubFilled,
  IconMailFilled,
  IconMessageCircle,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/contact')({
  head: () =>
    seo('/contact', {
      title: `${m.contact_title()} | ${websiteConfig.metadata?.name}`,
      description: m.contact_description(),
    }),
  component: ContactPage,
});

function ContactPage() {
  const supportEmail = websiteConfig.mail?.supportEmail;
  const mailto = getMailtoUrl(supportEmail);
  const emailAddress =
    supportEmail?.match(/<([^>]+)>/)?.[1] ?? supportEmail ?? '';
  const github = websiteConfig.social?.github;

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-3xl space-y-8 pb-16">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <IconMessageCircle className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {m.contact_title()}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {m.contact_description()}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {mailto && (
            <a
              href={mailto}
              className="rounded-lg border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconMailFilled className="mb-4 size-5 text-primary" />
              <h2 className="font-semibold">{m.contact_email_support()}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {m.contact_email_support_description()}
              </p>
              <p className="mt-4 text-sm font-medium text-primary">
                {emailAddress}
              </p>
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IconBrandGithubFilled className="mb-4 size-5 text-primary" />
              <h2 className="font-semibold">{m.contact_github()}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {m.contact_github_description()}
              </p>
              <p className="mt-4 text-sm font-medium text-primary">
                camaker/lang-study
              </p>
            </a>
          )}
        </div>
        {mailto && (
          <div className="flex justify-center">
            <a
              href={mailto}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'inline-flex items-center gap-2 rounded-lg'
              )}
            >
              <IconMailFilled className="size-4" />
              {m.contact_support_cta()}
            </a>
          </div>
        )}
      </div>
    </Container>
  );
}
