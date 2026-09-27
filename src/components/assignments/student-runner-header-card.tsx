import type {
  PublicAssignmentRuleSummaryItem,
  PublicAssignmentRuleSummaryStats,
} from '@/assignments/delivery-summary';
import type {
  StudentRunnerHeaderView,
  StudentRunnerTeacherAction,
} from '@/assignments/student-runner-view';
import { PublicAssignmentRules } from '@/components/assignments/public-assignment-rules';
import { buttonVariants } from '@/components/ui/button';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconCalendarDue,
  IconChevronDown,
  IconClipboardText,
  IconClock,
  IconListCheck,
  IconRepeat,
  type Icon,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type StudentRunnerHeaderCardProps = {
  templateLabel: string;
  view: StudentRunnerHeaderView;
};

export function StudentRunnerHeaderCard({
  templateLabel,
  view,
}: StudentRunnerHeaderCardProps) {
  const keyRules = pickKeyRules(
    view.ruleSummaryView.items,
    view.ruleSummaryView.summary
  );

  return (
    <header className="grid gap-5">
      <div className="grid gap-2">
        <p className="font-semibold text-primary text-sm">{templateLabel}</p>
        <h1 className="text-balance font-bold text-3xl tracking-tight md:text-4xl">
          {view.title}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground leading-7">
          {m.student_play_intro()}
        </p>
      </div>

      <ul
        aria-label={view.ruleSummaryView.title}
        className="flex flex-wrap gap-2"
      >
        {keyRules.map((rule) => (
          <KeyRuleChip key={rule.id} rule={rule} />
        ))}
      </ul>

      {view.instructions ? (
        <section
          aria-label={view.instructions.label}
          className="flex gap-3 rounded-lg border border-info/40 bg-info/10 p-4"
        >
          <IconClipboardText
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-info"
          />
          <div className="grid gap-1">
            <p className="font-semibold text-sm">{view.instructions.label}</p>
            <p className="text-base leading-7">{view.instructions.value}</p>
          </div>
        </section>
      ) : null}

      <details className="group rounded-lg border bg-background">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
          {m.student_play_rules_toggle()}
          <IconChevronDown
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="border-t px-4 py-3">
          <PublicAssignmentRules summaryView={view.ruleSummaryView} />
        </div>
      </details>

      <StudentRunnerTeacherActionLink action={view.teacherAction} />
    </header>
  );
}

const KEY_RULE_ICONS: Partial<
  Record<PublicAssignmentRuleSummaryItem['id'], Icon>
> = {
  attempts: IconRepeat,
  closes: IconCalendarDue,
  items: IconListCheck,
  timer: IconClock,
};

/**
 * Only the rules that change how a student works make the first screen: the
 * question count, and a timer, close time, or attempt limit when one is set.
 */
function pickKeyRules(
  items: PublicAssignmentRuleSummaryItem[],
  summary: PublicAssignmentRuleSummaryStats
) {
  return items.filter((rule) => {
    if (rule.id === 'items') return true;
    if (rule.id === 'timer') return summary.hasTimer;
    if (rule.id === 'closes') return summary.hasCloseTime;
    if (rule.id === 'attempts') return summary.hasAttemptLimit;
    return false;
  });
}

function KeyRuleChip({ rule }: { rule: PublicAssignmentRuleSummaryItem }) {
  const RuleIcon = KEY_RULE_ICONS[rule.id] ?? IconListCheck;
  const text =
    rule.id === 'items' ? rule.value : `${rule.label}: ${rule.value}`;

  return (
    <li
      aria-label={rule.ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 font-medium text-sm"
    >
      <RuleIcon aria-hidden="true" className="size-4 text-muted-foreground" />
      {text}
    </li>
  );
}

/**
 * Starter previews invite teachers to build their own activity. Real
 * assignment links show nothing teacher-facing to students.
 */
function StudentRunnerTeacherActionLink({
  action,
}: {
  action: StudentRunnerTeacherAction;
}) {
  if (action.type !== 'create-activity') return null;

  return (
    <Link
      to={action.to}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
    >
      {action.label}
    </Link>
  );
}
