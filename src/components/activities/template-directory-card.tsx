import type { TemplatesPageCardView } from '@/activities/entry-page-view';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { getPathWithLocale } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import {
  IconArrowRight,
  IconArrowsLeftRight,
  IconBox,
  IconCards,
  IconCategory,
  IconForms,
  IconHeadphones,
  IconLine,
  IconListCheck,
  IconPlus,
  IconVolume,
  type TablerIcon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type TemplateDirectoryCardProps = {
  template: TemplatesPageCardView;
};

export function TemplateDirectoryCard({
  template,
}: TemplateDirectoryCardProps) {
  const guide = getLocale() === 'en' ? templateGuides[template.template] : null;
  const TemplateIcon = templateVisuals[template.template].icon;

  return (
    <Card
      role="article"
      aria-label={template.ariaLabel}
      className="flex h-full flex-col overflow-hidden rounded-xl"
    >
      <CardHeader className="pb-4">
        <div
          className={cn(
            'mb-1 flex size-10 items-center justify-center rounded-lg',
            templateVisuals[template.template].className
          )}
        >
          <TemplateIcon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{template.name}</h2>
        </CardTitle>
        <CardDescription>
          <p>{template.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <TemplateExamplePreview template={template} />

        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">
            {template.bestForLabel}:
          </span>{' '}
          {template.bestFor}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {template.contentRequirements.map((requirement) => (
            <Badge
              key={requirement.id}
              variant="outline"
              className="rounded-md"
            >
              {requirement.label}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-2">
          <Link
            aria-label={template.action.ariaLabel}
            to={getPathWithLocale(template.action.to)}
            search={template.action.search}
            className={cn(buttonVariants(), 'w-full')}
          >
            <IconPlus className="size-4" aria-hidden="true" />
            {template.action.label}
          </Link>
          {guide ? (
            <a
              href={guide.href}
              className="flex min-h-10 items-center justify-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {guide.label()}
              <IconArrowRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** Each game gets its own icon and colour so the directory is scannable. */
const templateVisuals: Record<
  TemplatesPageCardView['template'],
  { className: string; icon: TablerIcon }
> = {
  'fill-blank': {
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    icon: IconForms,
  },
  'group-sort': {
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    icon: IconCategory,
  },
  'line-match': {
    className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    icon: IconLine,
  },
  listening: {
    className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    icon: IconHeadphones,
  },
  'match-up': {
    className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    icon: IconArrowsLeftRight,
  },
  'matching-pairs': {
    className: 'bg-pink-500/15 text-pink-700 dark:text-pink-300',
    icon: IconCards,
  },
  'open-box': {
    className: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    icon: IconBox,
  },
  quiz: {
    className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    icon: IconListCheck,
  },
};

const templateGuides: Partial<
  Record<
    TemplatesPageCardView['template'],
    { href: string; label: () => string }
  >
> = {
  quiz: {
    href: '/classroom-quiz-game',
    label: m.templates_page_guide_quiz,
  },
  'matching-pairs': {
    href: '/classroom-matching-game',
    label: m.templates_page_guide_matching,
  },
};

function TemplateExamplePreview({
  template,
}: {
  template: TemplatesPageCardView;
}) {
  const example = getActivityTemplateScaffold(template.template);
  const question = parseFirstLine(example.questionsText)[0];
  const options = parseFirstLine(example.questionsText)[2]
    ?.split(',')
    .map((option) => option.trim())
    .filter(Boolean)
    .slice(0, 3);
  const pairs = example.pairsText
    .split('\n')
    .slice(0, 2)
    .map((line) => line.split('|').map((part) => part.trim()));
  const groups = example.groupsText
    .split('\n')
    .slice(0, 2)
    .map((line) => line.split('|').map((part) => part.trim()));

  return (
    <div
      data-template-example={template.template}
      className="min-h-36 rounded-lg bg-muted/50 p-4"
    >
      <p className="text-xs font-medium text-primary">
        {m.templates_page_example_label()}
      </p>
      <p className="mt-1 line-clamp-1 text-sm font-semibold">{example.title}</p>
      {template.template === 'quiz' ? (
        <div className="mt-3">
          <p className="line-clamp-2 text-sm leading-5">{question}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {options?.map((option) => (
              <span
                key={option}
                className="rounded-md bg-background px-2 py-1 text-xs"
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {template.template === 'fill-blank' ||
      template.template === 'open-box' ? (
        <p className="mt-3 rounded-md bg-background px-3 py-3 text-sm leading-5">
          {question}
        </p>
      ) : null}
      {template.template === 'listening' ? (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-background px-3 py-3">
          <IconVolume
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="h-2 flex-1 rounded-full bg-primary/20" />
          <span className="text-xs text-muted-foreground">
            {example.subject}
          </span>
        </div>
      ) : null}
      {template.template === 'group-sort' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {groups.map(([group, items]) => (
            <div
              key={group}
              className="rounded-md bg-background px-2 py-2 text-xs"
            >
              <span className="block font-semibold">{group}</span>
              <span className="mt-1 block text-muted-foreground">
                {items?.split(',')[0]?.trim()}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {template.template === 'match-up' ? (
        <div className="mt-3 grid gap-1.5 text-xs">
          {pairs.map(([left, right], index) => (
            <div key={`${left}-${index}`} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 rounded-md bg-background px-2 py-1.5">
                {left}
              </span>
              <IconArrowRight
                className="size-3 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 rounded-md bg-background px-2 py-1.5">
                {right}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {template.template === 'line-match' ? (
        <div className="mt-3 grid grid-cols-[1fr_2rem_1fr] gap-2 text-xs">
          <div className="grid gap-1.5">
            {pairs.map(([left], index) => (
              <span
                key={`${left}-${index}`}
                className="rounded-md bg-background px-2 py-1.5"
              >
                {left}
              </span>
            ))}
          </div>
          <div
            className="flex flex-col justify-around text-center text-primary/60"
            aria-hidden="true"
          >
            <span>····</span>
            <span>····</span>
          </div>
          <div className="grid gap-1.5">
            {pairs
              .slice()
              .reverse()
              .map(([, right], index) => (
                <span
                  key={`${right}-${index}`}
                  className="rounded-md bg-background px-2 py-1.5"
                >
                  {right}
                </span>
              ))}
          </div>
        </div>
      ) : null}
      {template.template === 'matching-pairs' ? (
        <div className="mt-3 grid grid-cols-2 gap-1.5 text-center text-xs">
          {pairs
            .flat()
            .slice(0, 4)
            .map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-md bg-background px-2 py-2"
              >
                {value}
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );
}

function parseFirstLine(value: string) {
  return (value.split('\n')[0] ?? '').split('|').map((part) => part.trim());
}
