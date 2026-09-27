import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildGroupSortRunnerView,
  resolveGroupSortRunnerAction,
  resolveGroupSortSelectedItemId,
  type GroupSortRunnerAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import {
  RUNNER_BOARD_FRAME,
  RUNNER_BOARD_HELP,
  RUNNER_BOARD_LABEL,
  RUNNER_TARGET_READY,
  RUNNER_TILE,
  RUNNER_TILE_SELECTED,
} from '@/components/activities/runner-board-styles';
import { cn } from '@/lib/utils';
import { IconCheck, IconCircle, IconLayoutColumns } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

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
  useEffect(() => {
    setSelectedItemId((current) =>
      resolveGroupSortSelectedItemId({
        items,
        selectedItemId: current,
      })
    );
  }, [items]);
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
    <div className={RUNNER_BOARD_FRAME}>
      {copy.helpText ? (
        <p className={RUNNER_BOARD_HELP}>{copy.helpText}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <div className="flex min-h-9 items-center justify-between gap-2">
            <div className={cn(RUNNER_BOARD_LABEL, 'flex items-center gap-2')}>
              <IconLayoutColumns
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              {copy.itemListLabel}
            </div>
            {runnerView.selectedItem ? (
              <button
                type="button"
                disabled={disabled}
                className="rounded-md px-2 py-1 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-60"
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
            <div className="rounded-xl border-2 border-dashed p-4 text-base text-muted-foreground">
              {copy.emptyItemsLabel}
            </div>
          )}
        </div>

        <div className="grid content-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {runnerView.groupViews.map(
            ({ action, group, id, placedItemViews }) => (
              <div key={id} className="grid content-start gap-2">
                <button
                  type="button"
                  disabled={!selectedItemId || disabled}
                  className={cn(
                    RUNNER_TILE,
                    'bg-muted/50',
                    selectedItemId && !disabled && RUNNER_TARGET_READY
                  )}
                  onClick={() => handleRunnerAction(action)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{group}</span>
                    <span className="rounded-full bg-background px-2 font-semibold text-muted-foreground text-sm tabular-nums">
                      {placedItemViews.length}
                    </span>
                  </div>
                </button>

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
                  <div
                    aria-hidden="true"
                    className="min-h-14 rounded-xl border-2 border-dashed"
                  />
                ) : null}
              </div>
            )
          )}
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
        RUNNER_TILE,
        compact && 'min-h-12 py-2',
        selected && RUNNER_TILE_SELECTED,
        reviewStatusClassName
      )}
      onClick={() => onSelect(action)}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{item.prompt}</span>
        {selected ? (
          <IconCheck
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
      {revealAnswer && reviewItem ? (
        <PublicAnswerFeedback
          correctLabel={correctLabel}
          reviewItem={reviewItem}
        />
      ) : null}
    </button>
  );
}
