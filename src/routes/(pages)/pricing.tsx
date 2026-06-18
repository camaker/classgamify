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
import {
  IconBook2,
  IconCreditCard,
  IconPrinter,
  IconShieldCheck,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
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
  const decisionCards = [
    {
      icon: IconBook2,
      title: m.pricing_decision_learners_title(),
      description: m.pricing_decision_learners_description(),
    },
    {
      icon: IconPrinter,
      title: m.pricing_decision_worksheets_title(),
      description: m.pricing_decision_worksheets_description(),
    },
    {
      icon: IconUsers,
      title: m.pricing_decision_teachers_title(),
      description: m.pricing_decision_teachers_description(),
    },
  ];
  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {m.pricing_title()}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {m.pricing_subtitle()}
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground sm:grid-cols-3">
          <TrustSignal
            icon={IconCreditCard}
            label={m.pricing_trust_checkout()}
          />
          <TrustSignal
            icon={IconShieldCheck}
            label={m.pricing_trust_secure()}
          />
          <TrustSignal
            icon={IconPrinter}
            label={m.pricing_trust_free_preview()}
          />
        </div>
        <PricingTable
          currentPlan={currentPlan}
          metadata={userId ? { userId } : undefined}
        />
        <section className="grid gap-4 md:grid-cols-3">
          {decisionCards.map((card) => (
            <div key={card.title} className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                <card.icon className="size-4" />
              </div>
              <h2 className="font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </section>
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

function TrustSignal({
  icon: IconComponent,
  label,
}: {
  icon: TablerIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <IconComponent className="size-4 shrink-0 text-primary" />
      <span>{label}</span>
    </div>
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
          'HSK1 Pro 解锁完整 HSK1 课程、间隔复习、错字历史、无限打印练习纸和自定义字表，适合想系统练完整套汉字的人。',
      },
      {
        question: '适合老师和家长吗？',
        answer:
          '适合。练习纸和自定义字表会优先服务老师、家长和 tutor 布置练习的场景。',
      },
      {
        question: '现在可以付款吗？',
        answer:
          '可以。登录后选择月付、年付或早期终身版，会进入安全的 Creem 结账流程；如果只是想试用，可以先用免费练习和练习纸预览。',
      },
      {
        question: '应该选月付、年付还是终身版？',
        answer:
          '短期自学可以先选月付；准备系统学完整 HSK1 或持续打印练习纸，年付更合适；老师、家长或早期支持者可以考虑终身版。',
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
        'HSK1 Pro unlocks the full HSK1 path, spaced review, mistake history, unlimited worksheets, and custom character lists for learners who want a structured writing routine.',
    },
    {
      question: 'Is this useful for teachers and parents?',
      answer:
        'Yes. Printable worksheets and custom lists are designed for tutors, teachers, and parents assigning handwriting practice.',
    },
    {
      question: 'Can users pay right now?',
      answer:
        'Yes. After signing in, monthly, yearly, and Early Lifetime plans open a secure Creem checkout. If you are still evaluating, start with the free practice flow and worksheet preview.',
    },
    {
      question: 'Should I choose monthly, yearly, or lifetime?',
      answer:
        'Choose monthly for short-term self-study, yearly if you plan to work through the full HSK1 path, and Early Lifetime if you are a teacher, parent, or early supporter who expects to keep using worksheet and character packs.',
    },
  ];
}
