import type { BlogPost } from '@/lib/blog';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';

type VisualTone = 'templates' | 'assignments' | 'ai' | 'results';

type BlogVisualMetricId =
  | 'accuracy'
  | 'attempts'
  | 'draft'
  | 'link'
  | 'match'
  | 'open'
  | 'quiz'
  | 'reteach'
  | 'review'
  | 'save'
  | 'sort'
  | 'timer';

type BlogVisualMetricView = {
  id: BlogVisualMetricId;
  label: string;
};

type BlogVisualCopy = {
  footer: string;
  label: string;
  metrics: BlogVisualMetricView[];
  title: string;
};

const visualStyles: Record<VisualTone, { accent: string }> = {
  templates: {
    accent: 'bg-indigo-600',
  },
  assignments: {
    accent: 'bg-emerald-600',
  },
  ai: {
    accent: 'bg-violet-600',
  },
  results: {
    accent: 'bg-sky-600',
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
  const style = visualStyles[tone];
  const copy = getVisualCopy(tone);
  const isHero = size === 'hero';

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
        <span>{m.built_with_brand()}</span>
        <span>{copy.label}</span>
      </div>

      <div className="absolute left-4 top-12 w-[44%] sm:left-5 sm:top-14">
        <div className="rounded-lg border border-zinc-200 bg-white/90 p-3 shadow-sm">
          <div className={cn('mb-3 h-1.5 w-12 rounded-full', style.accent)} />
          <div className="space-y-2">
            <div className="h-2 w-4/5 rounded-full bg-zinc-200" />
            <div className="h-2 w-3/5 rounded-full bg-zinc-200" />
            <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
          </div>
          <p className="mt-4 truncate text-sm font-semibold">{copy.title}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
          {copy.metrics.map((metric) => (
            <div
              className={cn(
                'flex aspect-square items-center justify-center rounded-md border border-zinc-200 bg-white px-1 text-center text-[10px] font-bold shadow-sm sm:text-xs',
                isHero && 'sm:text-sm'
              )}
              key={metric.id}
            >
              {metric.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 top-12 w-[43%] rounded-lg border border-zinc-200 bg-white/88 p-3 shadow-sm sm:bottom-5 sm:right-5 sm:top-14 sm:p-4">
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className={cn('h-1.5 w-12 rounded-full', style.accent)} />
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
            <span className={cn('size-2 rounded-full', style.accent)} />
            <span className="text-[11px] font-semibold text-zinc-700">
              {copy.footer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getVisualCopy(tone: VisualTone): BlogVisualCopy {
  switch (tone) {
    case 'assignments':
      return {
        footer: m.blog_visual_assignments_footer(),
        label: m.blog_visual_assignments_label(),
        metrics: [
          {
            id: 'link',
            label: m.blog_visual_assignments_metric_link(),
          },
          {
            id: 'timer',
            label: m.blog_visual_assignments_metric_timer(),
          },
          {
            id: 'open',
            label: m.blog_visual_assignments_metric_open(),
          },
        ],
        title: m.blog_visual_assignments_title(),
      };
    case 'ai':
      return {
        footer: m.blog_visual_ai_footer(),
        label: m.blog_visual_ai_label(),
        metrics: [
          {
            id: 'draft',
            label: m.blog_visual_ai_metric_draft(),
          },
          {
            id: 'review',
            label: m.blog_visual_ai_metric_review(),
          },
          {
            id: 'save',
            label: m.blog_visual_ai_metric_save(),
          },
        ],
        title: m.blog_visual_ai_title(),
      };
    case 'results':
      return {
        footer: m.blog_visual_results_footer(),
        label: m.blog_visual_results_label(),
        metrics: [
          {
            id: 'accuracy',
            label: m.blog_visual_results_metric_accuracy(),
          },
          {
            id: 'attempts',
            label: m.blog_visual_results_metric_attempts(),
          },
          {
            id: 'reteach',
            label: m.blog_visual_results_metric_reteach(),
          },
        ],
        title: m.blog_visual_results_title(),
      };
    case 'templates':
      return {
        footer: m.blog_visual_templates_footer(),
        label: m.blog_visual_templates_label(),
        metrics: [
          {
            id: 'quiz',
            label: m.blog_visual_templates_metric_quiz(),
          },
          {
            id: 'match',
            label: m.blog_visual_templates_metric_match(),
          },
          {
            id: 'sort',
            label: m.blog_visual_templates_metric_sort(),
          },
        ],
        title: m.blog_visual_templates_title(),
      };
  }
}

function getVisualTone(post: BlogPost): VisualTone {
  if (post.slug === 'assignment-links-without-lms') {
    return 'assignments';
  }

  if (post.slug === 'ai-drafts-teacher-review') {
    return 'ai';
  }

  if (post.slug === 'results-that-drive-reteaching') {
    return 'results';
  }

  return 'templates';
}
