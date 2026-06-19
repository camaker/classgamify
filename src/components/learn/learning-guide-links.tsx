import { Badge } from '@/components/ui/badge';
import { getLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconBook2,
  IconFileText,
  IconListDetails,
  IconPencil,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type LearningGuideMode = 'course' | 'practice';

type LearningGuideLink = {
  description: string;
  icon: typeof IconBook2;
  slug: string;
  title: string;
};

export function LearningGuideLinks({ mode }: { mode: LearningGuideMode }) {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const copy = getLearningGuideCopy(currentLocale, mode);

  return (
    <section
      aria-labelledby={`learning-guide-${mode}`}
      className="rounded-lg border bg-muted/20 p-4 sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <Badge variant="outline" className="rounded-md border-primary/30">
            <IconBook2 className="size-3.5" />
            {copy.badge}
          </Badge>
          <div className="space-y-2">
            <h2
              id={`learning-guide-${mode}`}
              className="text-lg font-semibold tracking-normal"
            >
              {copy.title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          {copy.links.map((item) => (
            <Link
              key={item.slug}
              to="/blog/$slug"
              params={{ slug: item.slug }}
              className={cn(
                'group flex min-w-0 items-start gap-3 rounded-lg border',
                'bg-background p-3 transition-colors hover:border-primary/40',
                'hover:bg-background/80 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <IconArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function getLearningGuideCopy(
  locale: 'en' | 'zh',
  mode: LearningGuideMode
): {
  badge: string;
  description: string;
  links: LearningGuideLink[];
  title: string;
} {
  if (locale === 'zh') {
    return {
      badge: '学习方法',
      description:
        mode === 'course'
          ? '把线上描写、复习队列和纸笔作业连成一个稳定的学习节奏。'
          : '练习前先明确目标，练习后把错笔和纸面复习接回下一次学习。',
      links: [
        {
          description: '查看 50 个免费 HSK1 第一阶段汉字如何按小组练习。',
          icon: IconListDetails,
          slug: 'hsk1-chinese-characters-list',
          title: 'HSK1 汉字表和练习顺序',
        },
        {
          description: '用短练习推进新字、错字复习和打印练习纸。',
          icon: IconPencil,
          slug: 'how-to-practice-hsk1-characters',
          title: '10 分钟 HSK1 练习流程',
        },
        {
          description: '理解为什么笔顺、比例和纸笔练习会影响长期记忆。',
          icon: IconBook2,
          slug: 'why-handwriting-still-matters',
          title: '为什么学中文汉字仍然需要手写',
        },
        {
          description: '为自学、家教或课堂安排干净的打印作业。',
          icon: IconFileText,
          slug: 'printable-worksheets-for-classrooms',
          title: '打印练习纸怎么用',
        },
      ],
      title: mode === 'course' ? '配套学习指南' : '练习方法参考',
    };
  }

  return {
    badge: 'Learning method',
    description:
      mode === 'course'
        ? 'Connect online tracing, review queues, and paper assignments into a steady study rhythm.'
        : 'Set the goal before practice, then feed missed strokes and paper review into the next session.',
    links: [
      {
        description:
          'See how the 50 free HSK1 launch characters map into real practice groups.',
        icon: IconListDetails,
        slug: 'hsk1-chinese-characters-list',
        title: 'HSK1 character list and practice order',
      },
      {
        description:
          'Use short sessions to combine new characters, review, and printable worksheets.',
        icon: IconPencil,
        slug: 'how-to-practice-hsk1-characters',
        title: 'A 10-minute HSK1 practice loop',
      },
      {
        description:
          'See why stroke order, spacing, and paper practice support durable memory.',
        icon: IconBook2,
        slug: 'why-handwriting-still-matters',
        title: 'Why handwriting still matters',
      },
      {
        description:
          'Plan clean paper assignments for self-study, tutoring, or classrooms.',
        icon: IconFileText,
        slug: 'printable-worksheets-for-classrooms',
        title: 'How to use printable worksheets',
      },
    ],
    title:
      mode === 'course' ? 'Learning guides for this path' : 'Practice guides',
  };
}
