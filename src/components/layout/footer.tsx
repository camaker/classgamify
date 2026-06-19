import { m } from '@/locale/paraglide/messages';
import { getFooterLinks } from '@/config/footer-config';
import { Routes } from '@/lib/routes';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { Logo } from '@/components/shared/logo';
import { buttonVariants } from '@/components/ui/button';
import {
  IconArrowRight,
  IconExternalLink,
  IconFileText,
  IconMail,
  IconPencil,
} from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { websiteConfig } from '@/config/website';
import { getCourseStats } from '@/learn/hanzi-course';
export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = useLocation().pathname;
  const footerLinks = getFooterLinks();
  const courseStats = getCourseStats();
  return (
    <footer
      className={cn(
        'border-t bg-muted/30 text-foreground dark:bg-background',
        className
      )}
    >
      <Container className="px-4">
        <div className="grid gap-6 border-b py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">
              {m.footer_cta_eyebrow()}
            </p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-normal text-balance sm:text-3xl">
              {m.footer_cta_title()}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {m.footer_cta_description()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Link
              to={Routes.Learn}
              className={cn(buttonVariants(), 'w-full sm:w-auto')}
            >
              <IconPencil className="size-4" />
              {m.footer_cta_primary()}
            </Link>
            <Link
              to={Routes.Worksheets}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background sm:w-auto'
              )}
            >
              <IconFileText className="size-4" />
              {m.footer_cta_secondary()}
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(16rem,1.1fr)_2fr] lg:gap-14">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2">
              <Logo />
              <span className="text-xl font-semibold">
                {websiteConfig.metadata?.name}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {m.footer_tagline()}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <div className="border-l pl-3">
                <dt className="text-lg font-semibold leading-none">HSK1</dt>
                <dd className="mt-1 text-xs leading-4 text-muted-foreground">
                  {m.footer_metric_course()}
                </dd>
              </div>
              <div className="border-l pl-3">
                <dt className="text-lg font-semibold leading-none">
                  {courseStats.free}
                </dt>
                <dd className="mt-1 text-xs leading-4 text-muted-foreground">
                  {m.footer_metric_characters()}
                </dd>
              </div>
              <div className="border-l pl-3">
                <dt className="text-lg font-semibold leading-none">PDF</dt>
                <dd className="mt-1 text-xs leading-4 text-muted-foreground">
                  {m.footer_metric_worksheets()}
                </dd>
              </div>
            </dl>
          </div>

          <nav
            aria-label={m.footer_directory_label()}
            className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4"
          >
            {footerLinks?.map((section) => (
              <div key={section.title} className="min-w-0">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.items?.map(
                    (item) =>
                      item.href && (
                        <li key={item.title}>
                          <FooterLink item={item} pathname={pathname} />
                        </li>
                      )
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}.{' '}
            {m.footer_rights_reserved()}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              to={Routes.Contact}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary focus-visible:text-primary"
            >
              <IconMail className="size-4" />
              {m.footer_contact_short()}
            </Link>
            <span className="hidden text-border sm:inline" aria-hidden="true">
              /
            </span>
            <Link
              to={Routes.PrivacyPolicy}
              className="transition-colors hover:text-primary focus-visible:text-primary"
            >
              {m.nav_privacy_policy_title()}
            </Link>
            <Link
              to={Routes.TermsOfService}
              className="transition-colors hover:text-primary focus-visible:text-primary"
            >
              {m.nav_terms_of_service_title()}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({
  item,
  pathname,
}: {
  item: NonNullable<ReturnType<typeof getFooterLinks>[number]['items']>[number];
  pathname: string;
}) {
  const active =
    !item.external && isLinkActive(item.href, pathname) ? 'true' : undefined;
  const className =
    'group/link block rounded-md -mx-2 px-2 py-1.5 transition-colors hover:bg-background/70 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[active=true]:bg-background data-[active=true]:text-primary';
  const content = (
    <>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover/link:text-primary group-data-[active=true]/link:text-primary">
        {item.title}
        {item.external ? <IconExternalLink className="size-3.5" /> : null}
      </span>
      {item.description ? (
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
          {item.description}
        </span>
      ) : null}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={item.href} data-active={active} className={className}>
      {content}
      {active ? (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
          {m.footer_current_page()}
          <IconArrowRight className="size-3" />
        </span>
      ) : null}
    </Link>
  );
}
