import { m } from '@/locale/paraglide/messages';
import { ContactFormCard } from '@/components/contact/contact-form-card';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { getMailtoUrl } from '@/lib/urls';
import {
  buildContactPageViewModel,
  type ContactIntent,
  type ContactTopicId,
} from '@/pages/public-page-view';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconClipboardText,
  IconMailFilled,
  IconMessageCircle,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/contact')({
  validateSearch: (
    search
  ): {
    subject?: 'classroom';
  } => ({
    subject: search.subject === 'classroom' ? 'classroom' : undefined,
  }),
  head: () =>
    seo('/contact', {
      title: `${m.contact_title()} | ${websiteConfig.metadata?.name}`,
      description: m.contact_description(),
    }),
  component: ContactPage,
});

function ContactPage() {
  const { subject } = Route.useSearch();
  const intent: ContactIntent =
    subject === 'classroom' ? 'classroom' : 'general';
  const pageView = buildContactPageViewModel(intent);
  const supportEmail = websiteConfig.mail?.supportEmail;
  const emailAddress =
    supportEmail?.match(/<([^>]+)>/)?.[1] ?? supportEmail ?? '';
  const mailto = getSupportMailto(supportEmail, pageView.directSubject);

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <IconMessageCircle className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {pageView.hero.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {pageView.hero.description}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {pageView.topics.map((topic) => (
            <SupportTopicCard
              key={topic.id}
              icon={contactTopicIcons[topic.id]}
              title={topic.title}
              description={topic.description}
              href={getSupportMailto(supportEmail, topic.subject)}
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <div className="space-y-4">
            {pageView.inquiryPanel ? (
              <ClassroomInquiryPanel panel={pageView.inquiryPanel} />
            ) : null}
            <div className="rounded-lg border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                  <IconClipboardText className="size-4" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-semibold">{pageView.checklist.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {pageView.checklist.description}
                  </p>
                </div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm text-muted-foreground">
                {pageView.checklist.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {mailto ? (
                <a
                  href={mailto}
                  className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconMailFilled className="mb-4 size-5 text-primary" />
                  <h2 className="font-semibold">
                    {pageView.supportEmail.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pageView.supportEmail.description}
                  </p>
                  <p className="mt-4 break-all text-sm font-medium text-primary">
                    {emailAddress}
                  </p>
                </a>
              ) : null}
            </div>
          </div>
          <ContactFormCard intent={pageView.intent} />
        </div>
        {mailto ? (
          <div className="flex justify-center">
            <a
              href={mailto}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'inline-flex items-center gap-2 rounded-lg'
              )}
            >
              <IconMailFilled className="size-4" />
              {pageView.supportCtaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

function ClassroomInquiryPanel({
  panel,
}: {
  panel: NonNullable<
    ReturnType<typeof buildContactPageViewModel>['inquiryPanel']
  >;
}) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-background text-primary">
          <IconUsers className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-semibold">{panel.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {panel.description}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {panel.highlights.map((item) => (
          <div
            key={item.id}
            className="min-w-0 rounded-lg border bg-background/80 p-3"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportTopicCard({
  icon: IconComponent,
  title,
  description,
  href,
}: {
  icon: TablerIcon;
  title: string;
  description: string;
  href: string | undefined;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
          <IconComponent className="size-4" />
        </div>
        {href ? (
          <IconArrowRight className="size-4 text-muted-foreground" />
        ) : null}
      </div>
      <div className="mt-5 space-y-2">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </>
  );

  if (!href) {
    return <div className="rounded-lg border bg-card p-5">{content}</div>;
  }

  return (
    <a
      href={href}
      className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </a>
  );
}

function getSupportMailto(
  supportEmail: string | undefined,
  subject: string
): string | undefined {
  const baseMailto = getMailtoUrl(supportEmail);
  if (!baseMailto) return undefined;
  return `${baseMailto}?subject=${encodeURIComponent(subject)}`;
}

const contactTopicIcons = {
  classroom: IconUsers,
  partnership: IconSparkles,
  product: IconBook2,
} satisfies Record<ContactTopicId, TablerIcon>;
