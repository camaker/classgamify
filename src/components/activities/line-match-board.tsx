import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import type { StudentAnswerChange } from '@/assignments/student-submission';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildChoicePairingRunnerView,
  resolveChoicePairingRunnerAction,
  resolveChoicePairingSelectedItemId,
  type ChoicePairingRunnerAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import {
  RUNNER_BOARD_FRAME,
  RUNNER_BOARD_HELP,
  RUNNER_TARGET_READY,
  RUNNER_TILE,
  RUNNER_TILE_ANSWERED,
  RUNNER_TILE_SELECTED,
} from '@/components/activities/runner-board-styles';
import { cn } from '@/lib/utils';
import { IconCircle, IconLineDashed, IconLink } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

type LineMatchBoardProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChanges: (changes: StudentAnswerChange[]) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function LineMatchBoard({
  answers,
  disabled,
  items,
  onAnswerChanges,
  revealAnswer,
  reviewItems,
}: LineMatchBoardProps) {
  const copy = getActivityRunnerKindCopy('line-match');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  useEffect(() => {
    setSelectedItemId((current) =>
      resolveChoicePairingSelectedItemId({
        items,
        selectedItemId: current,
      })
    );
  }, [items]);
  const runnerView = useMemo(
    () =>
      buildChoicePairingRunnerView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
        selectedItemId,
      }),
    [
      answers,
      copy.progressVerb,
      items,
      revealAnswer,
      reviewItems,
      selectedItemId,
    ]
  );

  function handleRunnerAction(action: ChoicePairingRunnerAction) {
    const result = resolveChoicePairingRunnerAction({
      action,
      answers,
      disabled,
      items,
      selectedItemId,
    });

    setSelectedItemId(result.selectedItemId);
    if (result.type === 'answer') {
      onAnswerChanges(result.answerChanges);
    }
  }

  return (
    <div className={RUNNER_BOARD_FRAME}>
      <p className={RUNNER_BOARD_HELP}>{copy.helpText}</p>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          {runnerView.promptItemViews.map((itemView) => {
            const { answer, item, reviewItem, reviewStatusClassName } =
              itemView;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={cn(
                  RUNNER_TILE,
                  answer && RUNNER_TILE_ANSWERED,
                  itemView.selected && RUNNER_TILE_SELECTED,
                  reviewStatusClassName
                )}
                onClick={() => handleRunnerAction(itemView.action)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span>{itemView.promptLabel}</span>
                  {answer ? (
                    <IconLink
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-primary"
                    />
                  ) : (
                    <IconCircle
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-muted-foreground"
                    />
                  )}
                </div>
                {answer ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                    <IconLineDashed aria-hidden="true" className="size-4" />
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                      {answer}
                    </span>
                  </div>
                ) : null}
                {revealAnswer && reviewItem ? (
                  <PublicAnswerFeedback
                    correctLabel={copy.correctAnswerLabel}
                    reviewItem={reviewItem}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div aria-hidden="true" className="hidden justify-center md:flex">
          <div className="h-full w-px border-l-2 border-dashed" />
        </div>

        <div className="grid content-start gap-3">
          {runnerView.choiceViews.map(
            ({ action, choice, id, selected, usedByItemId }) => (
              <button
                key={id}
                type="button"
                disabled={!selectedItemId || disabled}
                className={cn(
                  RUNNER_TILE,
                  selectedItemId && !disabled && RUNNER_TARGET_READY,
                  usedByItemId && 'text-muted-foreground',
                  selected && RUNNER_TILE_SELECTED
                )}
                onClick={() => handleRunnerAction(action)}
              >
                <span>{choice}</span>
                {usedByItemId ? (
                  <Badge variant="outline" className="ml-2 rounded-md">
                    {copy.usedChoiceLabel}
                  </Badge>
                ) : null}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
