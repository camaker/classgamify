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
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconChartBar,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconLock,
  IconSchool,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  head: () => {
    const faqItems = getPricingFaqItems();
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
  const copy = getPricingCopy();
  const faqItems = getPricingFaqItems();

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-10 pb-16">
        <section className="mx-auto max-w-3xl space-y-4 text-center">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconSparkles className="size-3.5" />
            {copy.eyebrow}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {m.pricing_title()}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {m.pricing_subtitle()}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {copy.valueCards.map((item) => (
            <ValueCard key={item.title} item={item} />
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
              {copy.schoolEyebrow}
            </div>
            <h2 className="text-xl font-semibold">{copy.schoolTitle}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy.schoolDescription}
            </p>
          </div>
          <Link
            to={Routes.ContactClassroom}
            className={cn(buttonVariants(), 'w-full md:w-auto')}
          >
            {copy.schoolCta}
            <IconArrowRight className="size-4" />
          </Link>
        </section>

        <section className="mx-auto max-w-3xl space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {copy.faqTitle}
            </h2>
            <p className="text-muted-foreground">{copy.faqDescription}</p>
          </div>
          <Accordion
            type="single"
            collapsible
            className="rounded-lg border px-4"
          >
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
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
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <item.icon className="size-4" />
      </div>
      <h2 className="mt-4 font-semibold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
  );
}

function getPricingCopy() {
  return {
    eyebrow: m.pricing_eyebrow(),
    faqDescription: m.pricing_faq_description(),
    faqTitle: m.pricing_faq_title(),
    schoolCta: m.pricing_school_cta(),
    schoolDescription: m.pricing_school_description(),
    schoolEyebrow: m.pricing_school_eyebrow(),
    schoolTitle: m.pricing_school_title(),
    valueCards: [
      {
        description: m.pricing_value_templates_description(),
        icon: IconLayoutGrid,
        title: m.pricing_value_templates_title(),
      },
      {
        description: m.pricing_value_assignments_description(),
        icon: IconDeviceGamepad2,
        title: m.pricing_value_assignments_title(),
      },
      {
        description: m.pricing_value_ai_description(),
        icon: IconSparkles,
        title: m.pricing_value_ai_title(),
      },
    ],
  };
}

function getPricingFaqItems() {
  return [
    {
      question: m.pricing_faq_free_question(),
      answer: m.pricing_faq_free_answer(),
    },
    {
      question: m.pricing_faq_pro_question(),
      answer: m.pricing_faq_pro_answer(),
    },
    {
      question: m.pricing_faq_templates_question(),
      answer: m.pricing_faq_templates_answer(),
    },
    {
      question: m.pricing_faq_student_accounts_question(),
      answer: m.pricing_faq_student_accounts_answer(),
    },
    {
      question: m.pricing_faq_schools_question(),
      answer: m.pricing_faq_schools_answer(),
    },
  ];
}
