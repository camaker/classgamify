import type { BlogPost } from '@/lib/blog';
import { cn } from '@/lib/utils';

type VisualTone = 'templates' | 'assignments' | 'ai' | 'results';

const visualCopy: Record<
  VisualTone,
  {
    accent: string;
    metrics: string[];
    footer: Record<'en' | 'zh', string>;
    label: Record<'en' | 'zh', string>;
    title: Record<'en' | 'zh', string>;
  }
> = {
  templates: {
    accent: 'bg-indigo-600',
    metrics: ['Quiz', 'Match', 'Sort'],
    footer: {
      en: 'Template-ready content',
      zh: '模板准备度',
    },
    label: {
      en: 'Activity loop',
      zh: '活动闭环',
    },
    title: {
      en: 'Food review',
      zh: '食物复习',
    },
  },
  assignments: {
    accent: 'bg-emerald-600',
    metrics: ['Link', 'Timer', 'Open'],
    footer: {
      en: 'Public student link',
      zh: '公开作业链接',
    },
    label: {
      en: 'Assignment',
      zh: '作业',
    },
    title: {
      en: '/play/food-review',
      zh: '/play/food-review',
    },
  },
  ai: {
    accent: 'bg-violet-600',
    metrics: ['Draft', 'Review', 'Save'],
    footer: {
      en: 'Teacher-reviewed AI',
      zh: '老师审阅 AI',
    },
    label: {
      en: 'AI authoring',
      zh: 'AI 创建',
    },
    title: {
      en: 'Source notes',
      zh: '课堂资料',
    },
  },
  results: {
    accent: 'bg-sky-600',
    metrics: ['82%', '14', '3'],
    footer: {
      en: 'Reteach signal',
      zh: '重讲信号',
    },
    label: {
      en: 'Results',
      zh: '结果',
    },
    title: {
      en: 'Class summary',
      zh: '班级汇总',
    },
  },
};

export function BlogPostVisual({
  className,
  post,
  size = 'card',
}: {
  className?: string;
  post: BlogPost;
  size?: 'card' | 'hero';
}) {
  const tone = getVisualTone(post);
  const copy = visualCopy[tone];
  const isHero = size === 'hero';
  const locale = post.locale === 'zh' ? 'zh' : 'en';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-video overflow-hidden bg-[#f8fafc] text-zinc-950',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_46%,#dcfce7_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[11px] font-semibold uppercase text-zinc-600 sm:inset-x-5 sm:top-5">
        <span>ClassGamify</span>
        <span>{copy.label[locale]}</span>
      </div>

      <div className="absolute left-4 top-12 w-[44%] sm:left-5 sm:top-14">
        <div className="rounded-lg border border-zinc-200 bg-white/90 p-3 shadow-sm">
          <div className={cn('mb-3 h-1.5 w-12 rounded-full', copy.accent)} />
          <div className="space-y-2">
            <div className="h-2 w-4/5 rounded-full bg-zinc-200" />
            <div className="h-2 w-3/5 rounded-full bg-zinc-200" />
            <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
          </div>
          <p className="mt-4 truncate text-sm font-semibold">
            {copy.title[locale]}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
          {copy.metrics.map((metric, index) => (
            <div
              className={cn(
                'flex aspect-square items-center justify-center rounded-md border border-zinc-200 bg-white px-1 text-center text-[10px] font-bold shadow-sm sm:text-xs',
                isHero && 'sm:text-sm'
              )}
              key={`${metric}-${index}`}
            >
              {metric}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 top-12 w-[43%] rounded-lg border border-zinc-200 bg-white/88 p-3 shadow-sm sm:bottom-5 sm:right-5 sm:top-14 sm:p-4">
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className={cn('h-1.5 w-12 rounded-full', copy.accent)} />
            <div className="h-2 w-4/5 rounded-full bg-zinc-200" />
            <div className="h-2 w-3/5 rounded-full bg-zinc-200" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                className="aspect-square rounded-sm border border-zinc-200 bg-zinc-50"
                key={index}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full', copy.accent)} />
            <span className="text-[11px] font-semibold text-zinc-700">
              {copy.footer[locale]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getVisualTone(post: BlogPost): VisualTone {
  const text = `${post.category} ${post.title}`.toLowerCase();

  if (
    text.includes('assignment') ||
    text.includes('作业') ||
    text.includes('lms')
  ) {
    return 'assignments';
  }

  if (text.includes('ai') || text.includes('草稿') || text.includes('创建')) {
    return 'ai';
  }

  if (
    text.includes('result') ||
    text.includes('reteach') ||
    text.includes('结果')
  ) {
    return 'results';
  }

  return 'templates';
}
