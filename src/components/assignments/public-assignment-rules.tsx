import type {
  PublicAssignmentRuleSummaryId,
  PublicAssignmentRuleSummaryItem,
} from '@/assignments/delivery-summary';
import {
  IconClock,
  IconEye,
  IconListCheck,
  IconRepeat,
  IconUser,
  type Icon,
} from '@tabler/icons-react';

type PublicAssignmentRulesProps = {
  rules: PublicAssignmentRuleSummaryItem[];
};

export function PublicAssignmentRules({ rules }: PublicAssignmentRulesProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {rules.map((rule) => (
        <PublicAssignmentRuleItem key={rule.label} rule={rule} />
      ))}
    </div>
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
  items: IconListCheck,
  timer: IconClock,
} satisfies Record<PublicAssignmentRuleSummaryId, Icon>;
