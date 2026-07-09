import type {
  PublicAssignmentRulesHandoffItemView,
  PublicAssignmentRulesHandoffView,
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
      <PublicAssignmentRulesHandoff view={summaryView.handoffView} />
    </section>
  );
}

function PublicAssignmentRulesHandoff({
  view,
}: {
  view: PublicAssignmentRulesHandoffView;
}) {
  const titleId = 'public-assignment-rules-handoff-title';
  const descriptionId = 'public-assignment-rules-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="public-assignment-rules"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <PublicAssignmentRulesHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function PublicAssignmentRulesHandoffItem({
  itemView,
}: {
  itemView: PublicAssignmentRulesHandoffItemView;
}) {
  const labelId = `public-assignment-rules-handoff-${itemView.id}-label`;
  const valueId = `public-assignment-rules-handoff-${itemView.id}-value`;
  const descriptionId = `public-assignment-rules-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
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
