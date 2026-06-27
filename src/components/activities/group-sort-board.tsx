import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildGroupSortRunnerView,
  resolveGroupSortRunnerAction,
  type GroupSortRunnerAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  IconCategory2,
  IconCheck,
  IconCircle,
  IconLayoutColumns,
} from '@tabler/icons-react';
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
      buildGroupSortRunnerView({
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

  function handleRunnerAction(action: GroupSortRunnerAction) {
    const result = resolveGroupSortRunnerAction({
      action,
      disabled,
      selectedItemId,
    });

    setSelectedItemId(result.selectedItemId);
    if (result.type === 'answer') {
      onAnswerChange(result.itemId, result.answer);
    }
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
              {copy.itemListLabel}
            </div>
            {runnerView.selectedItem ? (
              <button
                type="button"
                disabled={disabled}
                className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-default disabled:opacity-60"
                onClick={() =>
                  runnerView.selectedClearAction
                    ? handleRunnerAction(runnerView.selectedClearAction)
                    : undefined
                }
              >
                {copy.clearSelectionLabel}
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-2">
            {runnerView.unplacedItemViews.length ? (
              runnerView.unplacedItemViews.map(
                ({
                  action,
                  item,
                  reviewItem,
                  reviewStatusClassName,
                  selected,
                }) => (
                  <GroupSortItemButton
                    action={action}
                    correctLabel={copy.correctAnswerLabel}
                    key={item.id}
                    item={item}
                    reviewItem={reviewItem}
                    revealAnswer={revealAnswer}
                    reviewStatusClassName={reviewStatusClassName}
                    selected={selected}
                    onSelect={handleRunnerAction}
                    disabled={disabled}
                  />
                )
              )
            ) : (
              <div className="min-h-14 rounded-lg border border-dashed bg-background/60 p-3 text-sm text-muted-foreground">
                {copy.emptyItemsLabel}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {runnerView.groupViews.map(({ action, group, placedItemViews }) => {
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
                  onClick={() => handleRunnerAction(action)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{group}</p>
                    <Badge variant="secondary" className="rounded-md">
                      {placedItemViews.length}
                    </Badge>
                  </div>
                </button>

                <div className="mt-3 grid gap-2">
                  {placedItemViews.map(
                    ({
                      action,
                      item,
                      reviewItem,
                      reviewStatusClassName,
                      selected,
                    }) => (
                      <GroupSortItemButton
                        key={item.id}
                        correctLabel={copy.correctAnswerLabel}
                        action={action}
                        item={item}
                        reviewItem={reviewItem}
                        revealAnswer={revealAnswer}
                        reviewStatusClassName={reviewStatusClassName}
                        selected={selected}
                        onSelect={handleRunnerAction}
                        disabled={disabled}
                        compact
                      />
                    )
                  )}
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
  action,
  compact = false,
  correctLabel,
  disabled,
  item,
  onSelect,
  revealAnswer,
  reviewItem,
  reviewStatusClassName,
  selected,
}: {
  action: GroupSortRunnerAction;
  compact?: boolean;
  correctLabel: string;
  disabled: boolean;
  item: PublicRuntimeItem;
  onSelect: (action: GroupSortRunnerAction) => void;
  revealAnswer: boolean;
  reviewItem?: PublicAttemptReviewItem;
  reviewStatusClassName: string | undefined;
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
        reviewStatusClassName,
        compact && 'p-2'
      )}
      onClick={() => onSelect(action)}
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
