import type { BlogPost } from '@/lib/blog';
import { cn } from '@/lib/utils';

type VisualTone = 'hsk' | 'learning' | 'worksheets';

const visualCopy: Record<
  VisualTone,
  {
    accent: string;
    characters: string[];
    footer: Record<'en' | 'zh', string>;
    label: Record<'en' | 'zh', string>;
  }
> = {
  hsk: {
    accent: 'bg-primary',
    characters: ['人', '口', '日'],
    footer: {
      en: 'HSK1 stroke loop',
      zh: 'HSK1 笔顺练习',
    },
    label: {
      en: 'Starter characters',
      zh: '入门汉字',
    },
  },
  learning: {
    accent: 'bg-emerald-600',
    characters: ['写', '读', '复'],
    footer: {
      en: 'Screen to paper',
      zh: '从屏幕到纸面',
    },
    label: {
      en: 'Learning method',
      zh: '学习方法',
    },
  },
  worksheets: {
    accent: 'bg-sky-600',
    characters: ['田', '字', '格'],
    footer: {
      en: 'Printable practice',
      zh: '打印练习纸',
    },
    label: {
      en: 'Worksheet flow',
      zh: '练习纸流程',
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
        'relative aspect-video overflow-hidden bg-[#fff8ef] text-zinc-950',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff8ef_0%,#f8fafc_52%,#e0f2fe_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[11px] font-semibold uppercase text-zinc-600 sm:inset-x-5 sm:top-5">
        <span>Lang Study</span>
        <span>{copy.label[locale]}</span>
      </div>

      <div className="absolute left-4 top-12 w-[44%] sm:left-5 sm:top-14">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {copy.characters.map((character, index) => (
            <div
              className={cn(
                'flex aspect-square items-center justify-center rounded-md border border-zinc-200 bg-white text-3xl font-bold shadow-sm sm:text-5xl',
                isHero && 'sm:text-6xl'
              )}
              key={`${character}-${index}`}
            >
              {character}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              className="aspect-square rounded-sm border border-dashed border-zinc-300 bg-white/70"
              key={index}
            />
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
    text.includes('worksheet') ||
    text.includes('classroom') ||
    text.includes('练习纸')
  ) {
    return 'worksheets';
  }

  if (text.includes('hsk')) {
    return 'hsk';
  }

  return 'learning';
}
