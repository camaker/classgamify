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
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getPricingCopy(locale);
  const faqItems = getPricingFaqItems(locale);

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

function getPricingCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      eyebrow: 'ClassGamify 方案',
      faqDescription:
        '围绕活动模板、作业链接、学生结果和学校场景的购买前问题。',
      faqTitle: '常见问题',
      schoolCta: '咨询学校方案',
      schoolDescription:
        '如果你要给多个老师、校区或长期班级使用，先联系我们梳理教师席位、学生数据、模板需求和部署节奏。',
      schoolEyebrow: '学校与机构',
      schoolTitle: '需要多人教师工作区？',
      valueCards: [
        {
          description:
            '从 quiz、match-up、group sort、fill-blank、matching pairs 和 open-box 等核心模板开始。',
          icon: IconLayoutGrid,
          title: '模板库',
        },
        {
          description:
            '把一节课的内容保存成可复用活动，再发布成不同班级的作业链接。',
          icon: IconDeviceGamepad2,
          title: '活动和作业',
        },
        {
          description:
            '付费方案会围绕 AI 生成、批量改编、更多模板和结果报表持续扩展。',
          icon: IconSparkles,
          title: 'AI 创建加速',
        },
      ],
    };
  }

  return {
    eyebrow: 'ClassGamify plans',
    faqDescription:
      'Questions about activity templates, assignment links, student results, and school use.',
    faqTitle: 'Frequently asked questions',
    schoolCta: 'Talk to us',
    schoolDescription:
      'For multiple teachers, campuses, or long-running cohorts, contact us to plan teacher seats, student data handling, template needs, and rollout timing.',
    schoolEyebrow: 'Schools and teams',
    schoolTitle: 'Need a multi-teacher workspace?',
    valueCards: [
      {
        description:
          'Start with core templates such as quiz, match-up, group sort, fill-blank, matching pairs, and open-box activities.',
        icon: IconLayoutGrid,
        title: 'Template library',
      },
      {
        description:
          'Save lesson content as reusable activities, then publish separate assignment links for each class run.',
        icon: IconDeviceGamepad2,
        title: 'Activities and assignments',
      },
      {
        description:
          'Paid plans will expand around AI creation, remixing, more templates, and result reporting.',
        icon: IconSparkles,
        title: 'AI creation speed',
      },
    ],
  };
}

function getPricingFaqItems(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return [
      {
        question: '免费版适合做什么？',
        answer:
          '免费版适合试用核心创建流程：浏览模板、创建少量活动、打开学生预览，并验证是否适合你的课堂节奏。',
      },
      {
        question: 'Pro 主要解锁什么？',
        answer:
          'Pro 会围绕更多活动数量、更多发布作业、结果追踪、AI 生成和模板改编能力扩展。',
      },
      {
        question: '现在的模板数量为什么不多？',
        answer:
          '第一版故意只保留 4-6 个高频课堂模板，先把创建、发布、学生完成和结果闭环做稳，再继续增加模板。',
      },
      {
        question: '学生需要登录吗？',
        answer:
          'v1 设计倾向于公开作业链接和轻量学生姓名/匿名 token。教师账号用于创建、发布和查看结果。',
      },
      {
        question: '可以给学校或机构使用吗？',
        answer:
          '可以作为方向规划。学校场景需要进一步明确教师席位、学生数据、权限和合规要求，建议先联系我们。',
      },
    ];
  }

  return [
    {
      question: 'What is the free plan for?',
      answer:
        'The free plan is for testing the core creation loop: browse templates, create a small number of activities, open student previews, and see whether the workflow fits your class rhythm.',
    },
    {
      question: 'What will Pro unlock?',
      answer:
        'Pro will expand around higher activity and assignment limits, result tracking, AI generation, and faster template remixing.',
    },
    {
      question: 'Why are there only a few templates first?',
      answer:
        'The first version intentionally starts with 4-6 high-frequency classroom templates so creation, publishing, student play, and results become reliable before the catalog grows.',
    },
    {
      question: 'Do students need accounts?',
      answer:
        'The v1 direction is public assignment links with a lightweight student name or anonymous token. Teacher accounts own creation, publishing, and results.',
    },
    {
      question: 'Can schools or tutoring teams use it?',
      answer:
        'That is part of the product direction. School use needs teacher seats, student data rules, permissions, and rollout details, so contact us before a larger deployment.',
    },
  ];
}
