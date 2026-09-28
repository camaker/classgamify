import { IconChevronDown } from '@tabler/icons-react';

import type {
  AssignmentResultAttemptAnswerReviewView,
  AssignmentResultAttemptReviewCardView,
} from '@/assignments/result-view';
import { cn } from '@/lib/utils';

type AssignmentResultsAttemptReviewCardProps = {
  attemptView: AssignmentResultAttemptReviewCardView;
};

/**
 * One submission, collapsed to its summary row. Teachers open it only when
 * they want the answer-by-answer detail.
 */
export function AssignmentResultsAttemptReviewCard({
  attemptView,
}: AssignmentResultsAttemptReviewCardProps) {
  return (
    <details
      aria-label={attemptView.ariaLabel}
      className="group rounded-lg border bg-card"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-40 flex-1">
          <p className="font-medium">{attemptView.studentLabel}</p>
          <p className="text-muted-foreground text-sm">
            {attemptView.submittedAtLabel}
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          {attemptView.summaryMetricViews.map((metricView) => (
            <div key={`${attemptView.id}-${metricView.key}`}>
              <dt className="text-muted-foreground text-xs">
                {metricView.label}
              </dt>
              <dd className="font-semibold text-sm">
                <output aria-label={metricView.ariaLabel}>
                  {metricView.value}
                </output>
              </dd>
            </div>
          ))}
        </dl>
        <span className="font-semibold text-sm">{attemptView.badgeLabel}</span>
        <IconChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <ol className="divide-y border-t">
        {attemptView.answerViews.map((answerView) => (
          <AssignmentResultsAttemptAnswerReview
            key={`${attemptView.id}-${answerView.id}`}
            answerView={answerView}
          />
        ))}
      </ol>
    </details>
  );
}

const ANSWER_STATUS_CLASS = {
  correct: 'bg-success/10 text-success-text',
  idle: 'bg-muted text-muted-foreground',
  review: 'bg-error/10 text-error-text',
} as const;

function AssignmentResultsAttemptAnswerReview({
  answerView,
}: {
  answerView: AssignmentResultAttemptAnswerReviewView;
}) {
  return (
    <li aria-label={answerView.ariaLabel} className="grid gap-1 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 font-medium text-sm">{answerView.promptLabel}</p>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 font-medium text-xs',
            ANSWER_STATUS_CLASS[answerView.statusTone]
          )}
        >
          {answerView.statusLabel}
        </span>
      </div>
      <div className="grid gap-x-4 gap-y-1 text-muted-foreground text-sm sm:grid-cols-2">
        <p>{answerView.studentAnswerLineText}</p>
        <p>{answerView.expectedAnswerLineText}</p>
      </div>
      {answerView.acceptedAnswersLineText ? (
        <p className="text-muted-foreground text-sm">
          {answerView.acceptedAnswersLineText}
        </p>
      ) : null}
      {answerView.explanationText ? (
        <p className="text-muted-foreground text-sm">
          {answerView.explanationText}
        </p>
      ) : null}
    </li>
  );
}
