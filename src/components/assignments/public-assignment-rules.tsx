import type {
  PublicAssignmentRuleSummaryId,
  PublicAssignmentRuleSummaryItem,
  PublicAssignmentRuleSummaryStatusView,
  PublicAssignmentRuleSummaryView,
} from '@/assignments/delivery-summary';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  IconArrowsShuffle,
  IconClock,
  IconEye,
  IconListCheck,
  IconRepeat,
  IconUser,
  type Icon,
} from '@tabler/icons-react';

type PublicAssignmentRulesProps = {
  summaryView: PublicAssignmentRuleSummaryView;
};

export function PublicAssignmentRules({
  summaryView,
}: PublicAssignmentRulesProps) {
  return (
    <section aria-label={summaryView.title} className="grid gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{summaryView.title}</p>
          <p className="mt-1 max-w-2xl text-muted-foreground text-xs leading-5">
            {summaryView.description}
          </p>
        </div>
        <PublicAssignmentRuleStatus statusView={summaryView.status} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {summaryView.items.map((rule) => (
          <PublicAssignmentRuleItem key={rule.id} rule={rule} />
        ))}
      </div>
    </section>
  );
}

function PublicAssignmentRuleStatus({
  statusView,
}: {
  statusView: PublicAssignmentRuleSummaryStatusView;
}) {
  return (
    <Badge
      variant="outline"
      aria-label={statusView.ariaLabel}
      className={cn(
        'rounded-md bg-background',
        statusView.tone === 'attention' && 'border-primary/40 text-primary'
      )}
    >
      {statusView.label}
    </Badge>
  );
}

function PublicAssignmentRuleItem({
  rule,
}: {
  rule: PublicAssignmentRuleSummaryItem;
}) {
  return (
    <fieldset
      aria-label={rule.ariaLabel}
      className="flex min-w-0 items-center gap-2 rounded-lg border bg-background px-3 py-2"
    >
      <PublicAssignmentRuleIcon id={rule.id} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{rule.value}</p>
        <p className="text-xs text-muted-foreground">{rule.label}</p>
        <p className="text-xs text-muted-foreground/80">{rule.description}</p>
      </div>
    </fieldset>
  );
}

function PublicAssignmentRuleIcon({
  id,
}: {
  id: PublicAssignmentRuleSummaryId;
}) {
  const Icon = publicAssignmentRuleIcons[id];
  return <Icon className="size-4 shrink-0 text-primary" />;
}

const publicAssignmentRuleIcons = {
  answerReveal: IconEye,
  attempts: IconRepeat,
  closes: IconClock,
  identity: IconUser,
  itemOrder: IconArrowsShuffle,
  items: IconListCheck,
  timer: IconClock,
} satisfies Record<PublicAssignmentRuleSummaryId, Icon>;
