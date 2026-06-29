import type {
  AssignmentResultAttemptAnswerReviewView,
  AssignmentResultAttemptReviewCardView,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
import { IconListDetails } from '@tabler/icons-react';

type AssignmentResultsAttemptReviewCardProps = {
  attemptView: AssignmentResultAttemptReviewCardView;
};

export function AssignmentResultsAttemptReviewCard({
  attemptView,
}: AssignmentResultsAttemptReviewCardProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconListDetails className="size-4 text-primary" />
            <p className="font-medium text-sm">{attemptView.studentLabel}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {attemptView.submittedAtLabel}
          </p>
        </div>
        <Badge variant="secondary" className="rounded-md">
          {attemptView.badgeLabel}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {attemptView.answerViews.map((answerView) => (
          <AssignmentResultsAttemptAnswerReview
            key={`${attemptView.id}-${answerView.id}`}
            answerView={answerView}
          />
        ))}
      </div>
    </div>
  );
}

function AssignmentResultsAttemptAnswerReview({
  answerView,
}: {
  answerView: AssignmentResultAttemptAnswerReviewView;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-sm font-medium">{answerView.promptLabel}</p>
        <Badge
          variant={
            answerView.statusTone === 'correct' ? 'secondary' : 'outline'
          }
          className="rounded-md"
        >
          {answerView.statusLabel}
        </Badge>
      </div>
      <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <p>{answerView.studentAnswerLineText}</p>
        <p>{answerView.expectedAnswerLineText}</p>
      </div>
      {answerView.acceptedAnswersLineText ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {answerView.acceptedAnswersLineText}
        </p>
      ) : null}
      {answerView.explanationText ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {answerView.explanationText}
        </p>
      ) : null}
    </div>
  );
}
