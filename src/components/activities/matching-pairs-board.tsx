import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import type { StudentAnswerChange } from '@/assignments/student-submission';
import {
  buildMatchingPairsBoardHandoffView,
  type MatchingPairsBoardHandoffItemView,
  type MatchingPairsBoardHandoffView,
} from '@/assignments/matching-pairs-board-handoff';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildChoicePairingRunnerView,
  resolveChoicePairingRunnerAction,
  resolveChoicePairingSelectedItemId,
  type ChoicePairingRunnerAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconArrowsExchange, IconCheck, IconCircle } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

type MatchingPairsBoardProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChanges: (changes: StudentAnswerChange[]) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function MatchingPairsBoard({
  answers,
  disabled,
  items,
  onAnswerChanges,
  revealAnswer,
  reviewItems,
}: MatchingPairsBoardProps) {
  const copy = getActivityRunnerKindCopy('matching-pairs');
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

  const handoffView = useMemo(
    () =>
      buildMatchingPairsBoardHandoffView({
        disabled,
        revealAnswer,
        runnerView,
      }),
    [disabled, revealAnswer, runnerView]
  );

  return (
    <>
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconArrowsExchange className="size-4 text-primary" />
            {copy.title}
          </div>
          <Badge variant="outline" className="rounded-md">
            {runnerView.progressLabel}
          </Badge>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-2">
            {runnerView.promptItemViews.map((itemView) => {
              const { answer, item, reviewItem, reviewStatusClassName } =
                itemView;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    'min-h-20 rounded-lg border bg-background p-3 text-left transition-colors',
                    'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                    itemView.selected && 'border-primary bg-primary/10',
                    reviewStatusClassName
                  )}
                  onClick={() => handleRunnerAction(itemView.action)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      {itemView.promptLabel}
                    </p>
                    {itemView.selected ? (
                      <IconCheck className="mt-0.5 size-4 text-primary" />
                    ) : (
                      <IconCircle className="mt-0.5 size-4 text-muted-foreground" />
                    )}
                  </div>
                  {answer ? (
                    <span className="mt-3 inline-flex max-w-full rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                      {answer}
                    </span>
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

          <div className="grid content-start gap-2">
            {runnerView.choiceViews.map(
              ({ action, choice, id, selected, usedByItemId }) => (
                <button
                  key={id}
                  type="button"
                  disabled={!selectedItemId || disabled}
                  className={cn(
                    'min-h-14 rounded-lg border bg-background p-3 text-left text-sm transition-colors',
                    'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-70',
                    usedByItemId && 'bg-muted/30',
                    selected && 'border-primary bg-primary/10 text-primary'
                  )}
                  onClick={() => handleRunnerAction(action)}
                >
                  <span className="font-medium">{choice}</span>
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
      <MatchingPairsBoardHandoff view={handoffView} />
    </>
  );
}

function MatchingPairsBoardHandoff({
  view,
}: {
  view: MatchingPairsBoardHandoffView;
}) {
  const titleId = 'matching-pairs-board-handoff-title';
  const descriptionId = 'matching-pairs-board-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="matching-pairs-board"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <MatchingPairsBoardHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function MatchingPairsBoardHandoffItem({
  item,
}: {
  item: MatchingPairsBoardHandoffItemView;
}) {
  const labelId = `matching-pairs-board-handoff-${item.id}-label`;
  const valueId = `matching-pairs-board-handoff-${item.id}-value`;
  const descriptionId = `matching-pairs-board-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}
