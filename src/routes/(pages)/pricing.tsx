import { m } from '@/locale/paraglide/messages';
import { authClient } from '@/auth/client';
import Container from '@/components/layout/container';
import { PricingTable } from '@/components/pricing/pricing-table';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { websiteConfig } from '@/config/website';
import { useCurrentPlan } from '@/hooks/use-payment';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import {
  buildPricingFaqItems,
  buildPricingPageViewModel,
  type PricingValueCardId,
} from '@/pages/public-page-view';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconSchool,
  IconSparkles,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  head: () => {
    const faqItems = buildPricingFaqItems();
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    return {
      ...seo(Routes.Pricing, {
        title: `${m.pricing_title()} | ${websiteConfig.metadata?.name}`,
        description: m.pricing_description(),
      }),
      scripts: [jsonLdScript(faqJsonLd)],
    };
  },
  component: PricingPage,
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data: planData } = useCurrentPlan(!!userId);
  const currentPlan = planData?.currentPlan ?? null;
  const pageView = buildPricingPageViewModel();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        <section className="mx-auto max-w-3xl space-y-4 text-center">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconSparkles className="size-3.5" />
            {pageView.hero.eyebrow}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {pageView.hero.title}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {pageView.hero.subtitle}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pageView.valueCards.map((item) => (
            <ValueCard
              key={item.id}
              icon={pricingValueIcons[item.id]}
              item={item}
            />
          ))}
        </section>

        <div id="plans" className="scroll-mt-24">
          <PricingTable
            currentPlan={currentPlan}
            metadata={userId ? { userId } : undefined}
          />
        </div>

        <section className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <IconSchool className="size-4" />
              {pageView.schoolCta.eyebrow}
            </div>
            <h2 className="text-xl font-semibold">
              {pageView.schoolCta.title}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageView.schoolCta.description}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {pageView.schoolCta.label}
            <IconArrowRight className="size-4" />
          </Link>
        </section>

        <section className="mx-auto max-w-3xl space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {pageView.faq.title}
            </h2>
            <p className="text-muted-foreground">{pageView.faq.description}</p>
          </div>
          <Accordion
            type="single"
            collapsible
            className="rounded-lg border px-4"
          >
            {pageView.faq.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </Container>
  );
}

function ValueCard({
  icon: Icon,
  item,
}: {
  icon: TablerIcon;
  item: {
    description: string;
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
  );
}

const pricingValueIcons = {
  ai: IconSparkles,
  assignments: IconDeviceGamepad2,
  templates: IconLayoutGrid,
} satisfies Record<PricingValueCardId, TablerIcon>;
