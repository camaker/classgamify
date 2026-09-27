import type { AssignmentResultItemAnalysisCardView } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AssignmentResultsItemAnalysisCardProps = {
  itemView: AssignmentResultItemAnalysisCardView;
};

/**
 * One reteach priority: how many students got the item right, the prompt,
 * and the expected answer, so the teacher can explain it again.
 */
export function AssignmentResultsItemAnalysisCard({
  itemView,
}: AssignmentResultsItemAnalysisCardProps) {
  const rate = itemView.correctRateProgressValue;
  const tone =
    rate < 50
      ? { bar: 'bg-error', text: 'text-error-text' }
      : rate < 80
        ? { bar: 'bg-warning', text: 'text-warning-text' }
        : { bar: 'bg-success', text: 'text-success-text' };

  return (
    <div className="grid gap-2 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-semibold">{itemView.prompt}</p>
        <span
          className={cn(
            'shrink-0 font-bold text-2xl tabular-nums leading-none',
            tone.text
          )}
        >
          {itemView.correctRateLabel}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full', tone.bar)}
          style={{ width: `${Math.max(rate, 2)}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
        <Badge variant="outline" className="rounded-md">
          {itemView.kindLabel}
        </Badge>
        <span>{itemView.expectedAnswerSummaryText}</span>
        <span>{itemView.unansweredLabel}</span>
      </div>
      {itemView.acceptedAnswersLineText ? (
        <p className="text-muted-foreground text-sm">
          {itemView.acceptedAnswersLineText}
        </p>
      ) : null}
      {itemView.explanationText ? (
        <p className="text-sm leading-6">{itemView.explanationText}</p>
      ) : null}
    </div>
  );
}
