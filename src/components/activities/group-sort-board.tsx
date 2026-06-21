import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import { buildStudentRunnerView } from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  IconCategory2,
  IconCheck,
  IconCircle,
  IconLayoutColumns,
} from '@tabler/icons-react';
import type { MouseEventHandler } from 'react';
import { useMemo, useState } from 'react';

type GroupSortBoardProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function GroupSortBoard({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: GroupSortBoardProps) {
  const copy = getActivityRunnerKindCopy('group-sort');
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const runnerView = useMemo(
    () =>
      buildStudentRunnerView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        reviewItems,
      }),
    [answers, copy.progressVerb, items, reviewItems]
  );
  const selectedItem = selectedItemId
    ? runnerView.itemViewsById.get(selectedItemId)?.item
    : null;
  const unplacedItemViews = runnerView.itemViews.filter(
    (itemView) => !itemView.answered
  );

  function placeSelectedItem(group: string) {
    if (!selectedItemId || disabled) return;
    onAnswerChange(selectedItemId, group);
    setSelectedItemId(undefined);
  }

  function clearSelectedItem() {
    if (!selectedItemId || disabled) return;
    onAnswerChange(selectedItemId, '');
    setSelectedItemId(undefined);
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconCategory2 className="size-4 text-primary" />
          {copy.title}
        </div>
        <Badge variant="outline" className="rounded-md">
          {runnerView.progressLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IconLayoutColumns className="size-4 text-muted-foreground" />
              Items
            </div>
            {selectedItem ? (
              <button
                type="button"
                disabled={disabled}
                className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-default disabled:opacity-60"
                onClick={clearSelectedItem}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-2">
            {unplacedItemViews.length ? (
              unplacedItemViews.map(({ item, reviewItem }) => (
                <GroupSortItemButton
                  correctLabel={copy.correctAnswerLabel}
                  key={item.id}
                  item={item}
                  reviewItem={reviewItem}
                  revealAnswer={revealAnswer}
                  selected={selectedItemId === item.id}
                  onSelect={() =>
                    setSelectedItemId((current) =>
                      current === item.id ? undefined : item.id
                    )
                  }
                  disabled={disabled}
                />
              ))
            ) : (
              <div className="min-h-14 rounded-lg border border-dashed bg-background/60 p-3 text-sm text-muted-foreground">
                All items sorted
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {runnerView.choices.map((group) => {
            const placedItemViews = runnerView.itemViews.filter(
              (itemView) => itemView.answer === group
            );

            return (
              <div key={group} className="rounded-lg border bg-background p-3">
                <button
                  type="button"
                  disabled={!selectedItemId || disabled}
                  className={cn(
                    'min-h-14 w-full rounded-lg border bg-muted/20 p-3 text-left transition-colors',
                    'disabled:cursor-default disabled:opacity-100',
                    selectedItemId &&
                      !disabled &&
                      'border-primary/40 hover:border-primary/60 hover:bg-primary/5'
                  )}
                  onClick={() => placeSelectedItem(group)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{group}</p>
                    <Badge variant="secondary" className="rounded-md">
                      {placedItemViews.length}
                    </Badge>
                  </div>
                </button>

                <div className="mt-3 grid gap-2">
                  {placedItemViews.map(({ item, reviewItem }) => (
                    <GroupSortItemButton
                      key={item.id}
                      correctLabel={copy.correctAnswerLabel}
                      item={item}
                      reviewItem={reviewItem}
                      revealAnswer={revealAnswer}
                      selected={selectedItemId === item.id}
                      onSelect={() =>
                        setSelectedItemId((current) =>
                          current === item.id ? undefined : item.id
                        )
                      }
                      disabled={disabled}
                      compact
                    />
                  ))}
                  {!placedItemViews.length ? (
                    <div className="min-h-12 rounded-lg border border-dashed bg-muted/10 p-3" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GroupSortItemButton({
  compact = false,
  correctLabel,
  disabled,
  item,
  onSelect,
  revealAnswer,
  reviewItem,
  selected,
}: {
  compact?: boolean;
  correctLabel: string;
  disabled: boolean;
  item: PublicRuntimeItem;
  onSelect: MouseEventHandler<HTMLButtonElement>;
  revealAnswer: boolean;
  reviewItem?: PublicAttemptReviewItem;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-lg border bg-background p-3 text-left transition-colors',
        'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
        selected && 'border-primary bg-primary/10',
        revealAnswer && reviewItem?.correct && 'border-primary/35 bg-primary/5',
        revealAnswer &&
          reviewItem &&
          !reviewItem.correct &&
          'border-destructive/30 bg-destructive/5',
        compact && 'p-2'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{item.prompt}</p>
        {selected ? (
          <IconCheck className="mt-0.5 size-4 text-primary" />
        ) : (
          <IconCircle className="mt-0.5 size-4 text-muted-foreground" />
        )}
      </div>
      {revealAnswer && reviewItem ? (
        <PublicAnswerFeedback
          correctLabel={correctLabel}
          reviewItem={reviewItem}
        />
      ) : null}
    </button>
  );
}
