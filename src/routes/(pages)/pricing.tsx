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
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconCalendarMonth,
  IconCalendarStats,
  IconCircleCheck,
  IconCreditCard,
  IconInfinity,
  IconLock,
  IconPencil,
  IconPrinter,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const PRICING_TRIAL_CHARACTERS = ['人', '口', '日'];

export const Route = createFileRoute('/(pages)/pricing')({
  head: () => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const faqItems = getPricingFaqItems(currentLocale);
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
    const metadata = seo('/pricing', {
      title: `${m.pricing_title()} | ${websiteConfig.metadata?.name}`,
      description: m.pricing_description(),
    });

    return {
      ...metadata,
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
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const faqItems = getPricingFaqItems(currentLocale);
  const classroomCta = getPricingClassroomCta(currentLocale);
  const planComparison = getPricingPlanComparison(currentLocale);
  const planGuide = getPricingPlanGuide(currentLocale);
  const planFit = getPricingPlanFit(currentLocale);
  const trialWorksheetSearch = getPricingTrialWorksheetSearch(currentLocale);
  const nextStepCards = getPricingNextStepCards(
    currentLocale,
    trialWorksheetSearch
  );
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
        <section className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-3">
          {nextStepCards.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              search={item.search}
              className="group min-w-0 rounded-lg border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-primary">
                  <item.icon className="size-4" />
                </div>
                <IconArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </section>
        <PlanFitSection
          copy={planFit}
          trialWorksheetSearch={trialWorksheetSearch}
        />
        <div id="plans" className="scroll-mt-24">
          <PricingTable
            currentPlan={currentPlan}
            metadata={userId ? { userId } : undefined}
          />
        </div>
        <PlanComparisonSection comparison={planComparison} />
        <section className="space-y-4">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {planGuide.title}
            </h2>
            <p className="text-muted-foreground">{planGuide.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {planGuide.items.map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-5">
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
                  <item.icon className="size-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    {item.label}
                  </p>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
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
        <section className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <IconUsers className="size-4" />
              {classroomCta.eyebrow}
            </div>
            <h2 className="text-xl font-semibold">{classroomCta.title}</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {classroomCta.description}
            </p>
          </div>
          <Link
            to={Routes.Contact}
            search={{ subject: 'classroom' }}
            className={cn(buttonVariants(), 'w-fit shrink-0')}
          >
            {classroomCta.cta}
            <IconArrowRight className="size-4" />
          </Link>
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

type PricingComparisonState = 'included' | 'limited' | 'locked';
type PricingFitCadence = 'repeat' | 'try' | 'weekly';
type PricingFitPlan = 'classroom' | 'free' | 'lifetime' | 'pro';
type PricingFitUseCase = 'classroom' | 'family' | 'self';
type PricingRouteSearch = Record<string, unknown>;

type PricingComparisonRow = {
  label: string;
  state: PricingComparisonState;
  value: string;
};

type PricingComparisonPlan = {
  badge: string;
  highlighted?: boolean;
  rows: PricingComparisonRow[];
  subtitle: string;
  title: string;
};

type PricingComparisonCopy = {
  description: string;
  eyebrow: string;
  plans: PricingComparisonPlan[];
  title: string;
};

type PricingFitOption<T extends string> = {
  description: string;
  icon: TablerIcon;
  id: T;
  label: string;
};

type PricingFitRecommendation = {
  description: string;
  features: string[];
  primaryCta: string;
  secondaryCta: string;
  title: string;
};

type PricingFitCopy = {
  cadenceLabel: string;
  cadences: PricingFitOption<PricingFitCadence>[];
  description: string;
  planBadges: Record<PricingFitPlan, string>;
  planLabels: Record<PricingFitPlan, string>;
  recommendations: Record<PricingFitPlan, PricingFitRecommendation>;
  summary: (input: {
    cadence: string;
    plan: string;
    useCase: string;
  }) => string;
  title: string;
  useCaseLabel: string;
  useCases: PricingFitOption<PricingFitUseCase>[];
};

function PlanFitSection({
  copy,
  trialWorksheetSearch,
}: {
  copy: PricingFitCopy;
  trialWorksheetSearch: PricingRouteSearch;
}) {
  const [useCase, setUseCase] = useState<PricingFitUseCase>('self');
  const [cadence, setCadence] = useState<PricingFitCadence>('weekly');
  const plan = getPricingFitPlan(useCase, cadence);
  const recommendation = copy.recommendations[plan];
  const selectedUseCase = copy.useCases.find((item) => item.id === useCase);
  const selectedCadence = copy.cadences.find((item) => item.id === cadence);

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconSparkles className="size-3.5" />
            {copy.title}
          </Badge>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <PlanFitOptionGroup
          label={copy.useCaseLabel}
          options={copy.useCases}
          value={useCase}
          onChange={setUseCase}
        />
        <PlanFitOptionGroup
          label={copy.cadenceLabel}
          options={copy.cadences}
          value={cadence}
          onChange={setCadence}
        />
      </div>

      <div className="flex min-w-0 flex-col rounded-lg border bg-background p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className="rounded-md">{copy.planBadges[plan]}</Badge>
            <h2 className="mt-3 text-xl font-semibold">
              {recommendation.title}
            </h2>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
            {plan === 'free' ? (
              <IconPencil className="size-5" />
            ) : plan === 'lifetime' ? (
              <IconInfinity className="size-5" />
            ) : plan === 'classroom' ? (
              <IconUsers className="size-5" />
            ) : (
              <IconBook2 className="size-5" />
            )}
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.summary({
            cadence: selectedCadence?.label ?? '',
            plan: copy.planLabels[plan],
            useCase: selectedUseCase?.label ?? '',
          })}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {recommendation.description}
        </p>
        <ul className="mt-4 space-y-2">
          {recommendation.features.map((feature) => (
            <li
              key={feature}
              className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-sm leading-6"
            >
              <IconCircleCheck className="mt-1 size-4 text-emerald-600 dark:text-emerald-400" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row lg:flex-col">
          {plan === 'classroom' ? (
            <Link
              to={Routes.Contact}
              search={{ subject: 'classroom' }}
              className={cn(buttonVariants(), 'w-full')}
            >
              {recommendation.primaryCta}
              <IconArrowRight className="size-4" />
            </Link>
          ) : (
            <a href="#plans" className={cn(buttonVariants(), 'w-full')}>
              {recommendation.primaryCta}
              <IconArrowRight className="size-4" />
            </a>
          )}
          <Link
            to={Routes.Worksheets}
            search={trialWorksheetSearch}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full bg-background'
            )}
          >
            {recommendation.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

function PlanFitOptionGroup<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: PricingFitOption<T>[];
  value: T;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid gap-2 md:grid-cols-3">
        {options.map((option) => {
          const selected = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'min-w-0 rounded-lg border bg-background p-3 text-left',
                'transition-colors hover:border-primary/40 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring',
                selected && 'border-primary/40 bg-primary/10'
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <option.icon className="size-4 text-primary" />
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getPricingFitPlan(
  useCase: PricingFitUseCase,
  cadence: PricingFitCadence
): PricingFitPlan {
  if (useCase === 'classroom' && cadence === 'repeat') return 'classroom';
  if (useCase === 'classroom') return 'pro';
  if (useCase === 'family' && cadence === 'repeat') return 'lifetime';
  if (cadence === 'try') return 'free';
  if (cadence === 'repeat') return 'lifetime';
  return 'pro';
}

function getPricingPlanFit(locale: 'en' | 'zh'): PricingFitCopy {
  if (locale === 'zh') {
    return {
      cadenceLabel: '你准备怎么用？',
      cadences: [
        {
          description: '先跑通一次线上描写和打印流程。',
          icon: IconPencil,
          id: 'try',
          label: '先试用',
        },
        {
          description: '每周练字、复习错笔，并打印练习纸。',
          icon: IconCalendarStats,
          id: 'weekly',
          label: '每周练习',
        },
        {
          description: '长期复用字表、练习纸和作业流程。',
          icon: IconInfinity,
          id: 'repeat',
          label: '长期复用',
        },
      ],
      description:
        '根据真实使用场景快速判断该先免费试用、升级 HSK1 Pro、选择早期终身版，还是联系我们做课堂流程。',
      planBadges: {
        classroom: '课堂咨询',
        free: '先免费',
        lifetime: '长期更合适',
        pro: '推荐 Pro',
      },
      planLabels: {
        classroom: '课堂方案',
        free: '免费入门',
        lifetime: '早期终身版',
        pro: 'HSK1 Pro',
      },
      recommendations: {
        classroom: {
          description:
            '如果你要给多个学生持续布置汉字作业，先聊清楚学生数量、打印频率、是否需要自定义字表和未来语言扩展。',
          features: [
            '适合课堂、tutor 小班或家庭长期作业流',
            '围绕可复用练习纸和复习交接设计',
            '可以提前反馈你需要的语言包和班级流程',
          ],
          primaryCta: '联系课堂方案',
          secondaryCta: '先试练习纸',
          title: '先联系我们梳理课堂流程',
        },
        free: {
          description:
            '先验证 Lang Study 的核心闭环：看笔顺、跟随描写、记录错笔，再打印同一组汉字。',
          features: [
            '免费 HSK1 入门汉字',
            '笔顺动画和跟随描写',
            '基础打印练习纸预览',
          ],
          primaryCta: '查看免费方案',
          secondaryCta: '制作练习纸',
          title: '从免费入门开始',
        },
        lifetime: {
          description:
            '适合会长期反复使用字表、练习纸和未来语言包的用户，尤其是老师、家长和 tutor。',
          features: [
            '包含 HSK1 Pro 的完整学习闭环',
            '长期复用自定义字表和打印流程',
            '未来文字系统和语言包上线时更适合早期使用',
          ],
          primaryCta: '查看终身版',
          secondaryCta: '先试练习纸',
          title: '选择早期终身版',
        },
        pro: {
          description:
            '适合准备系统完成 HSK1 的学习者，把一次试练变成每周练习、复习和打印的稳定流程。',
          features: [
            '完整 HSK1 书写路径',
            '错笔记录、复习队列和每日目标',
            '更多练习纸和自定义字表能力',
          ],
          primaryCta: '查看 HSK1 Pro',
          secondaryCta: '制作练习纸',
          title: '选择 HSK1 Pro',
        },
      },
      summary: ({ cadence, plan, useCase }) =>
        `${useCase} + ${cadence}：建议先看 ${plan}。`,
      title: '帮我选方案',
      useCaseLabel: '你是谁？',
      useCases: [
        {
          description: '自己学中文，希望短时间内建立练字节奏。',
          icon: IconBook2,
          id: 'self',
          label: '自学者',
        },
        {
          description: '陪孩子、学生或一对一学员练习。',
          icon: IconUsers,
          id: 'family',
          label: '家长 / tutor',
        },
        {
          description: '给一组学生布置长期作业或课堂练习。',
          icon: IconShieldCheck,
          id: 'classroom',
          label: '课堂',
        },
      ],
    };
  }

  return {
    cadenceLabel: 'How will you use it?',
    cadences: [
      {
        description: 'Validate the online tracing and print workflow first.',
        icon: IconPencil,
        id: 'try',
        label: 'Try first',
      },
      {
        description:
          'Practice weekly, review missed strokes, and print sheets.',
        icon: IconCalendarStats,
        id: 'weekly',
        label: 'Weekly practice',
      },
      {
        description: 'Reuse lists, worksheets, and assignment routines often.',
        icon: IconInfinity,
        id: 'repeat',
        label: 'Long-term reuse',
      },
    ],
    description:
      'Answer two practical questions to decide whether to start free, upgrade to HSK1 Pro, choose Early Lifetime, or contact us for a classroom workflow.',
    planBadges: {
      classroom: 'Classroom fit',
      free: 'Start free',
      lifetime: 'Long-term fit',
      pro: 'Pro fit',
    },
    planLabels: {
      classroom: 'classroom workflow',
      free: 'Free Starter',
      lifetime: 'Early Lifetime',
      pro: 'HSK1 Pro',
    },
    recommendations: {
      classroom: {
        description:
          'For multiple learners and repeat assignments, start by clarifying learner count, worksheet frequency, custom lists, and future language scope.',
        features: [
          'Useful for classes, tutoring groups, or family homework routines',
          'Designed around reusable worksheets and review handoffs',
          'Lets you shape the classroom and language-pack roadmap early',
        ],
        primaryCta: 'Contact for classroom use',
        secondaryCta: 'Try a worksheet',
        title: 'Talk through the classroom workflow',
      },
      free: {
        description:
          'Use the free starter loop to test Lang Study: watch stroke order, trace, save missed strokes, then print the same set.',
        features: [
          'Free HSK1 starter characters',
          'Stroke-order animation and guided tracing',
          'Basic printable worksheet preview',
        ],
        primaryCta: 'View free plan',
        secondaryCta: 'Make a worksheet',
        title: 'Start with Free Starter',
      },
      lifetime: {
        description:
          'Best when you expect to reuse character lists, worksheets, and future language packs for a long time.',
        features: [
          'Includes the full HSK1 Pro learning loop',
          'Long-term reuse of custom lists and print workflows',
          'Better fit for future writing systems and language packs',
        ],
        primaryCta: 'View lifetime plan',
        secondaryCta: 'Try a worksheet',
        title: 'Choose Early Lifetime',
      },
      pro: {
        description:
          'Best when you want to turn one successful starter session into a weekly HSK1 writing, review, and print routine.',
        features: [
          'Complete HSK1 writing path',
          'Missed-stroke history, review queue, and daily targets',
          'More worksheets and custom character-list support',
        ],
        primaryCta: 'View HSK1 Pro',
        secondaryCta: 'Make a worksheet',
        title: 'Choose HSK1 Pro',
      },
    },
    summary: ({ cadence, plan, useCase }) =>
      `${useCase} + ${cadence}: ${plan} is the best next step.`,
    title: 'Find your plan fit',
    useCaseLabel: 'Who are you buying for?',
    useCases: [
      {
        description:
          'You are learning Chinese and want a steady writing habit.',
        icon: IconBook2,
        id: 'self',
        label: 'Self-study',
      },
      {
        description: 'You help a child, student, or tutoring learner practice.',
        icon: IconUsers,
        id: 'family',
        label: 'Parent / tutor',
      },
      {
        description: 'You assign practice to a group of learners over time.',
        icon: IconShieldCheck,
        id: 'classroom',
        label: 'Classroom',
      },
    ],
  };
}

function PlanComparisonSection({
  comparison,
}: {
  comparison: PricingComparisonCopy;
}) {
  return (
    <section className="space-y-4">
      <div className="mx-auto max-w-3xl space-y-2 text-center">
        <p className="text-sm font-medium text-primary">{comparison.eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {comparison.title}
        </h2>
        <p className="text-muted-foreground">{comparison.description}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {comparison.plans.map((plan) => (
          <PlanComparisonCard key={plan.title} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function PlanComparisonCard({ plan }: { plan: PricingComparisonPlan }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col rounded-lg border bg-card p-5',
        plan.highlighted && 'border-primary/30 bg-primary/5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">{plan.title}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {plan.subtitle}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md border px-2 py-1 text-xs font-medium',
            plan.highlighted
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'bg-muted/40 text-muted-foreground'
          )}
        >
          {plan.badge}
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {plan.rows.map((row) => (
          <PlanComparisonRowItem key={row.label} row={row} />
        ))}
      </div>
    </div>
  );
}

function PlanComparisonRowItem({ row }: { row: PricingComparisonRow }) {
  const StateIcon =
    row.state === 'included'
      ? IconCircleCheck
      : row.state === 'limited'
        ? IconSparkles
        : IconLock;

  return (
    <div className="grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-3">
      <StateIcon
        className={cn(
          'mt-1 size-4 shrink-0',
          row.state === 'included' && 'text-emerald-600 dark:text-emerald-400',
          row.state === 'limited' && 'text-amber-600 dark:text-amber-400',
          row.state === 'locked' && 'text-muted-foreground'
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{row.label}</p>
        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
          {row.value}
        </p>
      </div>
    </div>
  );
}

function getPricingNextStepCards(
  locale: 'en' | 'zh',
  trialWorksheetSearch: PricingRouteSearch
) {
  if (locale === 'zh') {
    return [
      {
        description: '先完成一个 HSK1 汉字，感受笔顺动画和跟随描写。',
        href: Routes.Learn,
        icon: IconPencil,
        title: '先练一个字',
      },
      {
        description:
          '直接打开 人、口、日 的预填样张，确认纸笔练习是否适合你的节奏。',
        href: Routes.Worksheets,
        icon: IconPrinter,
        search: trialWorksheetSearch,
        title: '试打一张练习纸',
      },
      {
        description: '如果你在为学生、孩子或 tutor 课程规划，先告诉我们场景。',
        href: Routes.Contact,
        icon: IconUsers,
        search: { subject: 'classroom' as const },
        title: '咨询课堂使用',
      },
    ];
  }

  return [
    {
      description:
        'Complete one HSK1 character first and feel the stroke-order loop.',
      href: Routes.Learn,
      icon: IconPencil,
      title: 'Practice one character',
    },
    {
      description:
        'Open a prefilled 人, 口, 日 sample sheet and see if paper practice fits your routine.',
      href: Routes.Worksheets,
      icon: IconPrinter,
      search: trialWorksheetSearch,
      title: 'Try a worksheet',
    },
    {
      description:
        'Planning for students, children, or tutoring? Tell us the workflow.',
      href: Routes.Contact,
      icon: IconUsers,
      search: { subject: 'classroom' as const },
      title: 'Ask about classroom use',
    },
  ];
}

function getPricingTrialWorksheetSearch(locale: 'en' | 'zh') {
  return {
    characters: PRICING_TRIAL_CHARACTERS,
    details: true,
    feedback: true,
    note:
      locale === 'zh'
        ? '购买前试用：先线上描写，再打印这组样张，检查纸笔练习和家长交接是否适合。'
        : 'Pre-purchase trial: trace online first, then print this sample set to check paper practice and parent handoff.',
    trace: 'guided',
  };
}

function getPricingClassroomCta(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      cta: '联系课堂方案',
      description:
        '如果你在为课堂、tutor 课程或家庭作业流设计汉字练习，可以告诉我们学生数量、打印需求和想覆盖的语言范围。',
      eyebrow: '课堂和家庭使用',
      title: '需要多人或长期作业场景？',
    };
  }

  return {
    cta: 'Contact for classroom use',
    description:
      'If you are planning character practice for a class, tutoring workflow, or family homework routine, tell us the learner count, worksheet needs, and future language scope.',
    eyebrow: 'Classroom and family use',
    title: 'Need a multi-learner or long-term assignment workflow?',
  };
}

function getPricingPlanComparison(locale: 'en' | 'zh'): PricingComparisonCopy {
  if (locale === 'zh') {
    return {
      description:
        '免费版用于验证练字闭环，Pro 用于系统完成 HSK1，早期终身版适合会长期复用字表、练习纸和未来语言包的用户。',
      eyebrow: '权益边界',
      plans: [
        {
          badge: '先试用',
          rows: [
            {
              label: '适合场景',
              state: 'included',
              value: '先确认笔顺动画、跟随描写和打印样张是否适合自己。',
            },
            {
              label: '学习范围',
              state: 'limited',
              value: '当前免费 HSK1 入门汉字，适合建立第一轮练习节奏。',
            },
            {
              label: '复习记录',
              state: 'limited',
              value: '在本浏览器保存错笔和复习提示，方便短期继续练。',
            },
            {
              label: '练习纸',
              state: 'limited',
              value: '可生成基础打印样张，用来验证纸笔练习流程。',
            },
          ],
          subtitle: '不需要先付款，先跑通一次真实练字流程。',
          title: '免费入门',
        },
        {
          badge: '推荐',
          highlighted: true,
          rows: [
            {
              label: '适合场景',
              state: 'included',
              value: '准备按完整 HSK1 路径持续练字、复习和打印。',
            },
            {
              label: '学习范围',
              state: 'included',
              value: '完整 HSK1 书写路径，围绕每周练习节奏展开。',
            },
            {
              label: '复习记录',
              state: 'included',
              value: '错笔历史、间隔复习和每日目标组成连续学习闭环。',
            },
            {
              label: '练习纸',
              state: 'included',
              value: '更多练习纸、自定义字表和适合家教/家庭作业的交付。',
            },
          ],
          subtitle: '把一次试练变成可持续完成 HSK1 的学习系统。',
          title: 'HSK1 Pro',
        },
        {
          badge: '长期',
          rows: [
            {
              label: '适合场景',
              state: 'included',
              value: '老师、家长、tutor 和希望长期支持产品的早期用户。',
            },
            {
              label: '学习范围',
              state: 'included',
              value: '包含 Pro，并优先获得后续文字系统和语言包访问。',
            },
            {
              label: '复习记录',
              state: 'included',
              value: '适合长期复用不同学习者的练习计划和作业流程。',
            },
            {
              label: '练习纸',
              state: 'included',
              value: '长期使用自定义字表、打印流程和课堂/家庭作业模板。',
            },
          ],
          subtitle: '面向长期复用练习纸、字表和未来语言扩展的人。',
          title: '早期终身版',
        },
      ],
      title: '升级后到底多了什么？',
    };
  }

  return {
    description:
      'Free Starter proves the writing loop, Pro turns it into a full HSK1 routine, and Early Lifetime is for people who expect to reuse lists, worksheets, and future language packs.',
    eyebrow: 'Plan boundaries',
    plans: [
      {
        badge: 'Try first',
        rows: [
          {
            label: 'Best for',
            state: 'included',
            value:
              'Testing stroke animation, guided tracing, and printable output before paying.',
          },
          {
            label: 'Learning scope',
            state: 'limited',
            value:
              'The current free HSK1 starter characters, enough to build the first practice rhythm.',
          },
          {
            label: 'Review record',
            state: 'limited',
            value:
              'Browser-saved missed strokes and review cues for short practice sessions.',
          },
          {
            label: 'Worksheets',
            state: 'limited',
            value:
              'Basic printable sample sheets to validate the paper practice workflow.',
          },
        ],
        subtitle: 'Run one real writing session without paying first.',
        title: 'Free Starter',
      },
      {
        badge: 'Recommended',
        highlighted: true,
        rows: [
          {
            label: 'Best for',
            state: 'included',
            value:
              'Learners who want to finish HSK1 with ongoing writing, review, and print practice.',
          },
          {
            label: 'Learning scope',
            state: 'included',
            value:
              'The complete HSK1 writing path organized around weekly practice.',
          },
          {
            label: 'Review record',
            state: 'included',
            value:
              'Mistake history, spaced review, and daily targets that keep the loop moving.',
          },
          {
            label: 'Worksheets',
            state: 'included',
            value:
              'More worksheets, custom character lists, and handoff tools for tutoring or family work.',
          },
        ],
        subtitle: 'Turn the starter loop into a repeatable HSK1 system.',
        title: 'HSK1 Pro',
      },
      {
        badge: 'Long term',
        rows: [
          {
            label: 'Best for',
            state: 'included',
            value:
              'Teachers, parents, tutors, and early supporters who expect long-term use.',
          },
          {
            label: 'Learning scope',
            state: 'included',
            value:
              'Includes Pro plus early access to future writing systems and language packs.',
          },
          {
            label: 'Review record',
            state: 'included',
            value:
              'Useful when planning repeatable routines across learners and assignments.',
          },
          {
            label: 'Worksheets',
            state: 'included',
            value:
              'Long-term reuse of custom lists, print workflows, and classroom or family templates.',
          },
        ],
        subtitle:
          'For reusable worksheets, custom lists, and future languages.',
        title: 'Early Lifetime',
      },
    ],
    title: 'What changes when you upgrade?',
  };
}

function getPricingPlanGuide(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      description:
        '先按学习周期选择，再按是否需要持续打印练习纸和自定义字表升级。',
      items: [
        {
          description:
            '适合先验证学习节奏、短期自学，或者只想试用完整 HSK1 工具包的用户。',
          icon: IconCalendarMonth,
          label: '低承诺',
          title: '月付',
        },
        {
          description:
            '适合准备系统完成 HSK1、每周复习和打印练习纸的学习者，长期成本更稳。',
          icon: IconCalendarStats,
          label: '推荐选择',
          title: '年付',
        },
        {
          description:
            '适合老师、家长、tutor 和早期支持者，后续持续使用字表和练习纸更划算。',
          icon: IconInfinity,
          label: '长期使用',
          title: '早期终身版',
        },
      ],
      title: '应该选哪个计划？',
    };
  }

  return {
    description:
      'Choose by learning horizon first, then by how often you need worksheets and custom character sets.',
    items: [
      {
        description:
          'Best for trying the full HSK1 toolkit, short self-study windows, or validating a new learning routine.',
        icon: IconCalendarMonth,
        label: 'Low commitment',
        title: 'Monthly',
      },
      {
        description:
          'Best for learners planning to finish HSK1 with weekly review, printable worksheets, and lower long-term cost.',
        icon: IconCalendarStats,
        label: 'Recommended',
        title: 'Yearly',
      },
      {
        description:
          'Best for teachers, parents, tutors, and early supporters who expect to reuse character lists and worksheets.',
        icon: IconInfinity,
        label: 'Long-term use',
        title: 'Early Lifetime',
      },
    ],
    title: 'Which plan should I choose?',
  };
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
