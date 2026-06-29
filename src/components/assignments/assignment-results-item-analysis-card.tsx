import type { buildAssignmentResultsPageViewModel } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type AssignmentResultsItemAnalysisView = ReturnType<
  typeof buildAssignmentResultsPageViewModel
>['itemAnalysisCardViews'][number];

type AssignmentResultsItemAnalysisCardProps = {
  itemView: AssignmentResultsItemAnalysisView;
};

export function AssignmentResultsItemAnalysisCard({
  itemView,
}: AssignmentResultsItemAnalysisCardProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-md">
          {itemView.kindLabel}
        </Badge>
        <span className="text-sm font-semibold">
          {itemView.correctRateLabel}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-medium">{itemView.prompt}</p>
      <Progress
        value={itemView.correctRateProgressValue}
        className="mt-3 h-2"
      />
      <AssignmentResultsItemAnalysisAnswerNotes itemView={itemView} />
    </div>
  );
}

function AssignmentResultsItemAnalysisAnswerNotes({
  itemView,
}: {
  itemView: AssignmentResultsItemAnalysisView;
}) {
  return (
    <>
      <p className="mt-2 text-xs text-muted-foreground">
        {itemView.expectedAnswerSummaryText}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {itemView.unansweredLabel}
      </p>
      {itemView.acceptedAnswersLineText ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {itemView.acceptedAnswersLineText}
        </p>
      ) : null}
      {itemView.explanationText ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {itemView.explanationText}
        </p>
      ) : null}
    </>
  );
}
