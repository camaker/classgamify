import { m } from '@/locale/paraglide/messages';
import { authClient } from '@/auth/client';
import Container from '@/components/layout/container';
import { PricingTable } from '@/components/pricing/pricing-table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { websiteConfig } from '@/config/website';
import { useCurrentPlan } from '@/hooks/use-payment';
import { getLocale } from '@/lib/locale';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  head: () =>
    seo('/pricing', {
      title: `${m.pricing_title()} | ${websiteConfig.metadata?.name}`,
      description: m.pricing_description(),
    }),
  component: PricingPage,
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data: planData } = useCurrentPlan(!!userId);
  const currentPlan = planData?.currentPlan ?? null;
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const faqItems = getPricingFaqItems(currentLocale);
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {m.pricing_title()}
          </h1>
          <p className="text-lg text-muted-foreground">
            {m.pricing_subtitle()}
          </p>
        </div>
        <PricingTable
          currentPlan={currentPlan}
          metadata={userId ? { userId } : undefined}
        />
        <section className="mx-auto max-w-3xl space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {currentLocale === 'zh'
                ? '常见问题'
                : 'Frequently asked questions'}
            </h2>
            <p className="text-muted-foreground">
              {currentLocale === 'zh'
                ? '围绕 HSK1 练习包和打印练习纸的购买前问题。'
                : 'Questions about the HSK1 pack and printable worksheets.'}
            </p>
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

function getPricingFaqItems(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return [
      {
        question: '免费版能用什么？',
        answer:
          '免费版可以练习 HSK1 入门汉字、观看笔顺动画、跟随描写，并生成基础打印练习纸。',
      },
      {
        question: 'HSK1 Pro 会解锁什么？',
        answer:
          'HSK1 Pro 计划解锁完整 HSK1 课程、间隔复习、错字历史、无限打印练习纸和自定义字表。',
      },
      {
        question: '适合老师和家长吗？',
        answer:
          '适合。练习纸和自定义字表会优先服务老师、家长和 tutor 布置练习的场景。',
      },
      {
        question: '现在可以付款吗？',
        answer:
          '现在是早期访问阶段。完整 HSK1 练习包开放购买前，你可以先使用免费练习和练习纸预览。',
      },
    ];
  }

  return [
    {
      question: 'What is included in Free Starter?',
      answer:
        'Free Starter includes the first HSK1 characters, stroke-order animation, guided tracing, and a basic printable worksheet preview.',
    },
    {
      question: 'What will HSK1 Pro unlock?',
      answer:
        'HSK1 Pro is planned to unlock the full HSK1 path, spaced review, mistake history, unlimited worksheets, and custom character lists.',
    },
    {
      question: 'Is this useful for teachers and parents?',
      answer:
        'Yes. Printable worksheets and custom lists are designed for tutors, teachers, and parents assigning handwriting practice.',
    },
    {
      question: 'Can users pay right now?',
      answer:
        'Lang Study is in early access. You can use the free practice flow and worksheet preview before paid checkout opens for the complete HSK1 pack.',
    },
  ];
}
