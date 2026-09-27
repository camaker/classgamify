import type {
  PublicAssignmentRuleSummaryId,
  PublicAssignmentRuleSummaryItem,
  PublicAssignmentRuleSummaryView,
} from '@/assignments/delivery-summary';
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
    <dl aria-label={summaryView.title} className="grid gap-3">
      {summaryView.items.map((rule) => (
        <PublicAssignmentRuleItem key={rule.id} rule={rule} />
      ))}
    </dl>
  );
}

function PublicAssignmentRuleItem({
  rule,
}: {
  rule: PublicAssignmentRuleSummaryItem;
}) {
  const RuleIcon = publicAssignmentRuleIcons[rule.id];

  return (
    <div className="grid min-w-0 gap-0.5">
      <dt className="flex items-center gap-2 font-medium text-sm">
        <RuleIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        {rule.label}: {rule.value}
      </dt>
      <dd className="pl-6 text-muted-foreground text-sm leading-6">
        {rule.description}
      </dd>
    </div>
  );
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
