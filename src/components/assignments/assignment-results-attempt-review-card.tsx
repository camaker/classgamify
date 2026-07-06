import { IconListDetails } from '@tabler/icons-react';
import { useId } from 'react';

import type {
  AssignmentResultAttemptAnswerReviewView,
  AssignmentResultAttemptReviewCardView,
} from '@/assignments/result-view';
import type {
  AssignmentAttemptReviewCardHandoffItemView,
  AssignmentAttemptReviewCardHandoffView,
} from '@/assignments/attempt-review-card-handoff';
import { Badge } from '@/components/ui/badge';

type AssignmentResultsAttemptReviewCardProps = {
  attemptView: AssignmentResultAttemptReviewCardView;
};

export function AssignmentResultsAttemptReviewCard({
  attemptView,
}: AssignmentResultsAttemptReviewCardProps) {
  return (
    <article
      aria-label={attemptView.ariaLabel}
      className="rounded-lg border bg-background p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconListDetails
              aria-hidden="true"
              className="size-4 text-primary"
            />
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
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y py-3 sm:grid-cols-4">
        {attemptView.summaryMetricViews.map((metricView) => (
          <div key={`${attemptView.id}-${metricView.key}`}>
            <dt className="text-[11px] text-muted-foreground">
              {metricView.label}
            </dt>
            <dd className="mt-1 font-semibold text-sm">
              <output aria-label={metricView.ariaLabel}>
                {metricView.value}
              </output>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 grid gap-2">
        {attemptView.answerViews.map((answerView) => (
          <AssignmentResultsAttemptAnswerReview
            key={`${attemptView.id}-${answerView.id}`}
            answerView={answerView}
          />
        ))}
      </div>
      <AssignmentResultsAttemptReviewCardHandoff
        view={attemptView.handoffView}
      />
    </article>
  );
}

function AssignmentResultsAttemptReviewCardHandoff({
  view,
}: {
  view: AssignmentAttemptReviewCardHandoffView;
}) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-attempt-review-card"
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      {view.itemViews.map((itemView) => (
        <AssignmentResultsAttemptReviewCardHandoffItem
          baseId={baseId}
          itemView={itemView}
          key={itemView.id}
        />
      ))}
    </section>
  );
}

function AssignmentResultsAttemptReviewCardHandoffItem({
  baseId,
  itemView,
}: {
  baseId: string;
  itemView: AssignmentAttemptReviewCardHandoffItemView;
}) {
  const itemId = `${baseId}-${itemView.id}`;
  const labelId = `${itemId}-label`;
  const valueId = `${itemId}-value`;
  const descriptionId = `${itemId}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <span id={labelId}>{itemView.label}</span>
      <output
        aria-describedby={descriptionId}
        aria-label={itemView.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        id={valueId}
      >
        {itemView.value}
      </output>
      <span id={descriptionId}>{itemView.description}</span>
    </div>
  );
}

function AssignmentResultsAttemptAnswerReview({
  answerView,
}: {
  answerView: AssignmentResultAttemptAnswerReviewView;
}) {
  return (
    <article
      aria-label={answerView.ariaLabel}
      className="rounded-lg border bg-muted/20 p-3"
    >
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
    </article>
  );
}
