import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  IconArrowsExchange,
  IconCheck,
  IconCircle,
  IconX,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type MatchingPairsBoardProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function MatchingPairsBoard({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: MatchingPairsBoardProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const reviewByItemId = useMemo(
    () =>
      new Map(
        reviewItems?.map((reviewItem) => [reviewItem.itemId, reviewItem]) ?? []
      ),
    [reviewItems]
  );
  const choices = useMemo(() => getUniqueChoices(items), [items]);
  const selectedAnswer = selectedItemId ? answers[selectedItemId] : undefined;

  function selectChoice(choice: string) {
    if (!selectedItemId || disabled) return;
    const usedByItemId = findChoiceOwner(answers, choice);
    if (usedByItemId && usedByItemId !== selectedItemId) {
      onAnswerChange(usedByItemId, '');
    }
    onAnswerChange(selectedItemId, choice);
    setSelectedItemId(undefined);
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconArrowsExchange className="size-4 text-primary" />
          Matching pairs
        </div>
        <Badge variant="outline" className="rounded-md">
          {items.filter((item) => answers[item.id]?.trim()).length}/
          {items.length} matched
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-2">
          {items.map((item, index) => {
            const answer = answers[item.id];
            const selected = selectedItemId === item.id;
            const reviewItem = reviewByItemId.get(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={cn(
                  'min-h-20 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                  selected && 'border-primary bg-primary/10',
                  revealAnswer &&
                    reviewItem?.correct &&
                    'border-primary/35 bg-primary/5',
                  revealAnswer &&
                    reviewItem &&
                    !reviewItem.correct &&
                    'border-destructive/30 bg-destructive/5'
                )}
                onClick={() =>
                  setSelectedItemId((current) =>
                    current === item.id ? undefined : item.id
                  )
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {index + 1}. {item.prompt}
                  </p>
                  {selected ? (
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
                  <PairReviewLine reviewItem={reviewItem} />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="grid content-start gap-2">
          {choices.map((choice) => {
            const usedByItemId = findChoiceOwner(answers, choice);
            const selected = selectedAnswer === choice;

            return (
              <button
                key={choice}
                type="button"
                disabled={!selectedItemId || disabled}
                className={cn(
                  'min-h-14 rounded-lg border bg-background p-3 text-left text-sm transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-70',
                  usedByItemId && 'bg-muted/30',
                  selected && 'border-primary bg-primary/10 text-primary'
                )}
                onClick={() => selectChoice(choice)}
              >
                <span className="font-medium">{choice}</span>
                {usedByItemId ? (
                  <Badge variant="outline" className="ml-2 rounded-md">
                    Used
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PairReviewLine({
  reviewItem,
}: {
  reviewItem: PublicAttemptReviewItem;
}) {
  return (
    <div
      className={cn(
        'mt-3 flex flex-wrap items-center gap-2 text-xs',
        reviewItem.correct ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      {reviewItem.correct ? (
        <IconCheck className="size-3.5" />
      ) : (
        <IconX className="size-3.5" />
      )}
      <span>{reviewItem.correct ? 'Correct' : 'Needs review'}</span>
      <span>Correct answer: {reviewItem.correctAnswer}</span>
    </div>
  );
}

function getUniqueChoices(items: PublicRuntimeItem[]) {
  const choices = new Set<string>();

  for (const item of items) {
    for (const choice of item.choices ?? []) {
      choices.add(choice);
    }
  }

  return [...choices];
}

function findChoiceOwner(answers: Record<string, string>, choice: string) {
  return Object.entries(answers).find(([, answer]) => answer === choice)?.[0];
}
