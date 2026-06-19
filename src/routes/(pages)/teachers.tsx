import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { jsonLdScript } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconClipboardText,
  IconFileText,
  IconMailForward,
  IconPencil,
  IconPrinter,
  IconRotate,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/teachers')({
  head: () => {
    const locale = getLocale() === 'zh' ? 'zh' : 'en';
    const copy = getTeachersCopy(locale);
    const teacherPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: copy.title,
      description: copy.description,
      url: `https://getlangstudy.com${Routes.Teachers}`,
      audience: [
        {
          '@type': 'Audience',
          audienceType: copy.audienceTeachers,
        },
        {
          '@type': 'Audience',
          audienceType: copy.audienceParents,
        },
      ],
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: copy.workflowStructuredItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          description: item.description,
        })),
      },
    };

    return {
      ...seo(Routes.Teachers, {
        title: `${copy.title} | ${websiteConfig.metadata?.name}`,
        description: copy.description,
      }),
      scripts: [jsonLdScript(teacherPageJsonLd)],
    };
  },
  component: TeachersPage,
});

function TeachersPage() {
  const locale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getTeachersCopy(locale);
  const workflowCards = [
    {
      icon: IconPencil,
      title: copy.workflowTraceTitle,
      description: copy.workflowTraceDescription,
    },
    {
      icon: IconRotate,
      title: copy.workflowReviewTitle,
      description: copy.workflowReviewDescription,
    },
    {
      icon: IconPrinter,
      title: copy.workflowPrintTitle,
      description: copy.workflowPrintDescription,
    },
  ];
  const useCases = [
    {
      icon: IconUsers,
      title: copy.useCaseClassroomTitle,
      description: copy.useCaseClassroomDescription,
    },
    {
      icon: IconBook2,
      title: copy.useCaseTutoringTitle,
      description: copy.useCaseTutoringDescription,
    },
    {
      icon: IconClipboardText,
      title: copy.useCaseFamilyTitle,
      description: copy.useCaseFamilyDescription,
    },
  ];
  const handoffItems = [
    copy.handoffItemReview,
    copy.handoffItemWorksheet,
    copy.handoffItemReturn,
  ];

  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-12 pb-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
          <div className="min-w-0 space-y-5">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              {copy.eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={Routes.Worksheets}
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-lg')}
              >
                <IconFileText className="size-4" />
                {copy.primaryCta}
              </Link>
              <Link
                to={Routes.ContactClassroom}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-lg bg-background'
                )}
              >
                <IconMailForward className="size-4" />
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                <IconClipboardText className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold">{copy.handoffTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {copy.handoffDescription}
                </p>
              </div>
            </div>
            <ol className="mt-5 grid gap-3">
              {handoffItems.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border bg-background/70 p-3 text-sm"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="leading-6 text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {workflowCards.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-6 rounded-lg border bg-muted/30 p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-5">
          <div className="min-w-0 space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {copy.planTitle}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {copy.planDescription}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.planStats.map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {useCases.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{copy.ctaTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.ctaDescription}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
            <Link
              to={Routes.Learn}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full rounded-lg bg-background sm:w-auto'
              )}
            >
              <IconPencil className="size-4" />
              {copy.practiceCta}
            </Link>
            <Link
              to={Routes.ContactClassroom}
              className={cn(buttonVariants(), 'w-full rounded-lg sm:w-auto')}
            >
              {copy.contactCta}
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}

function FeatureCard({
  item,
}: {
  item: {
    description: string;
    icon: TablerIcon;
    title: string;
  };
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
          <item.icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function getTeachersCopy(locale: 'en' | 'zh') {
  if (locale === 'zh') {
    return {
      audienceParents: '家长',
      audienceTeachers: '中文老师、辅导者和 tutor',
      contactCta: '咨询课堂使用',
      ctaDescription:
        '告诉我们你的学习人数、当前 HSK 等级、每周节奏和练习纸需求，我们会帮你把最稳定的流程先跑起来。',
      ctaTitle: '想把 Lang Study 用在课堂、辅导或家庭练习里？',
      description:
        '为中文老师、辅导者和家长准备的汉字练习流程：线上看笔顺，记录错笔，再打印干净的练习纸。',
      eyebrow: '老师与家长',
      handoffDescription:
        '一节课或一次家庭练习结束后，学生需要知道下次先复习什么，家长需要知道纸上该看什么。',
      handoffItemReturn:
        '下次先回到线上复习圈出的难字，再继续新字，避免每次重新安排。',
      handoffItemReview: '先用线上描写找出错笔和最难的汉字，让复习顺序有依据。',
      handoffItemWorksheet:
        '把同一组汉字打印成干净练习纸，适合课堂、作业和家庭陪练。',
      handoffTitle: '从线上练习到纸面作业',
      planDescription:
        'Lang Study 当前公开版本已经能支持小范围课堂或家庭试用。后续 Pro 会围绕完整字表、自定义字表、更多练习纸和作业交付继续扩展。',
      planStats: [
        { label: '从 HSK1 入门汉字开始', value: 'HSK1' },
        { label: '线上描写、错笔和复习队列', value: '复习' },
        { label: '可打印练习纸和作业说明', value: '纸笔' },
      ],
      planTitle: '先用一个可重复流程，而不是堆一堆材料',
      practiceCta: '体验练习流程',
      primaryCta: '生成练习纸',
      secondaryCta: '联系课堂使用',
      subtitle:
        'Lang Study 把笔顺动画、跟随描写、错笔复习和可打印练习纸放在同一个流程里，方便老师、辅导者和家长重复布置练习。',
      title: '给老师、辅导者和家长的中文汉字练习流程',
      useCaseClassroomDescription:
        '适合把一组汉字作为课后任务：学生先线上描写，完成后打印同一组做慢写。',
      useCaseClassroomTitle: '课堂作业',
      useCaseFamilyDescription:
        '家长可以看到孩子圈出的难字，下次直接从线上复习开始，不需要重新挑材料。',
      useCaseFamilyTitle: '家庭陪练',
      useCaseTutoringDescription:
        '一对一辅导可以围绕错笔和复习队列决定下次任务，把每次练习连起来。',
      useCaseTutoringTitle: '一对一辅导',
      workflowPrintDescription:
        '练习纸保留来源域名和线上复习入口，打印后也能自然回到网站继续练习。',
      workflowPrintTitle: '打印作业',
      workflowReviewDescription:
        '错笔和错误次数会进入本地复习队列，帮助下次先处理真正卡住的字。',
      workflowReviewTitle: '复习错笔',
      workflowTraceDescription:
        '学生先看笔顺动画，再跟着描写，系统记录本次错误和对应笔画。',
      workflowTraceTitle: '线上描写',
      workflowStructuredItems: [
        {
          name: '线上描写',
          description: '学生先看笔顺动画，再完成跟随描写，记录错笔和本次重点。',
        },
        {
          name: '复习错笔',
          description: '根据本地复习队列优先处理真正卡住的汉字和笔画。',
        },
        {
          name: '打印作业',
          description:
            '把同一组汉字生成可打印练习纸，并保留线上复习入口和域名归因。',
        },
      ],
    };
  }

  return {
    audienceParents: 'parents',
    audienceTeachers: 'Chinese teachers, tutors, and instructors',
    contactCta: 'Ask about classroom use',
    ctaDescription:
      'Tell us learner count, current HSK level, weekly rhythm, and worksheet needs. We will point you to the most stable workflow first.',
    ctaTitle: 'Want to use Lang Study with a class, tutoring group, or child?',
    description:
      'A Chinese character practice workflow for teachers, tutors, and parents: review stroke order online, capture missed strokes, then print clean worksheets.',
    eyebrow: 'Teachers and parents',
    handoffDescription:
      'After a class or home practice session, learners need a clear next review target and adults need a paper artifact they can actually use.',
    handoffItemReturn:
      'Start the next session by reviewing circled hard characters online before adding new ones.',
    handoffItemReview:
      'Use guided tracing to reveal missed strokes and decide what should come back first.',
    handoffItemWorksheet:
      'Print the same character set as a clean worksheet for class, homework, or family practice.',
    handoffTitle: 'From online tracing to paper homework',
    planDescription:
      'The public Lang Study flow is already useful for small classroom or family trials. Pro will expand this around full character packs, custom lists, worksheet volume, and assignment handoff.',
    planStats: [
      { label: 'Starts with beginner HSK1 characters', value: 'HSK1' },
      { label: 'Tracing, missed strokes, and review queue', value: 'Review' },
      { label: 'Printable worksheets and handoff notes', value: 'Paper' },
    ],
    planTitle: 'Use one repeatable workflow, not a pile of materials',
    practiceCta: 'Try the practice flow',
    primaryCta: 'Make worksheets',
    secondaryCta: 'Contact for classroom use',
    subtitle:
      'Lang Study connects stroke animation, guided tracing, missed-stroke review, and printable worksheets so teachers, tutors, and parents can assign repeatable Chinese writing practice.',
    title: 'Chinese character practice for teachers, tutors, and parents',
    useCaseClassroomDescription:
      'Assign a character set after class: learners trace online first, then print the same set for slow handwriting.',
    useCaseClassroomTitle: 'Classroom homework',
    useCaseFamilyDescription:
      'Parents can look at circled hard characters and restart the next session from online review instead of choosing new materials.',
    useCaseFamilyTitle: 'Family practice',
    useCaseTutoringDescription:
      'Tutors can use missed strokes and the review queue to decide the next assignment instead of treating every session as isolated.',
    useCaseTutoringTitle: 'One-on-one tutoring',
    workflowPrintDescription:
      'Worksheets keep the domain and online review link visible so paper practice naturally returns to Lang Study.',
    workflowPrintTitle: 'Print homework',
    workflowReviewDescription:
      'Mistakes and missed stroke numbers become a local review queue so the next session starts with the real hard parts.',
    workflowReviewTitle: 'Review missed strokes',
    workflowTraceDescription:
      'Learners watch stroke order, trace from memory, and the session records mistakes and missed strokes.',
    workflowTraceTitle: 'Trace online',
    workflowStructuredItems: [
      {
        name: 'Trace online',
        description:
          'Learners watch stroke order, complete guided tracing, and record missed strokes.',
      },
      {
        name: 'Review missed strokes',
        description:
          'The local review queue prioritizes characters and strokes that need another pass.',
      },
      {
        name: 'Print homework',
        description:
          'The same character set becomes a printable worksheet with an online review link and Lang Study attribution.',
      },
    ],
  };
}
