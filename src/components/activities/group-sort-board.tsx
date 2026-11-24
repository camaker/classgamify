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
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';
import {
  IconCheck,
  IconCircle,
  IconHandFinger,
  IconLayoutColumns,
} from '@tabler/icons-react';
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
  const [pendingGroup, setPendingGroup] = useState<string>();
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
        pendingGroup,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
        selectedItemId,
      }),
    [
      answers,
      copy.progressVerb,
      items,
      pendingGroup,
      revealAnswer,
      reviewItems,
      selectedItemId,
    ]
  );

  function handleRunnerAction(action: GroupSortRunnerAction) {
    const result = resolveGroupSortRunnerAction({
      action,
      disabled,
      pendingGroup: runnerView.pendingGroup,
      selectedItemId,
    });

    setSelectedItemId(result.selectedItemId);
    setPendingGroup(
      result.type === 'pending-group' ? result.pendingGroup : undefined
    );
    if (result.type === 'answer') {
      onAnswerChange(result.itemId, result.answer);
    }
  }

  const pendingPrompt =
    runnerView.pendingGroup && !disabled
      ? m.activity_runner_group_sort_pending_prompt({
          group: runnerView.pendingGroup,
        })
      : undefined;
  const placePrompt =
    runnerView.selectedItem && !disabled
      ? m.activity_runner_group_sort_place_prompt({
          item: runnerView.selectedItem.prompt,
        })
      : undefined;

  return (
    <div className={RUNNER_BOARD_FRAME}>
      {copy.helpText ? (
        <p className={RUNNER_BOARD_HELP}>{copy.helpText}</p>
      ) : null}
      {/* Always mounted so screen readers hear each new sorting step. */}
      <p aria-live="polite" className="sr-only">
        {pendingPrompt ?? placePrompt ?? ''}
      </p>

      <div>
        {placePrompt && runnerView.selectedItem ? (
          <div
            data-testid="group-sort-place-bar"
            className="sticky top-2 z-20 mb-4 grid gap-2 rounded-xl border bg-background/95 p-3 shadow-md backdrop-blur lg:hidden"
          >
            <p className="font-medium text-sm">{placePrompt}</p>
            <div className="flex flex-wrap gap-2">
              {runnerView.groupViews.map(({ action, group, id }) => (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'bg-background'
                  )}
                  onClick={() => handleRunnerAction(action)}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {pendingPrompt ? (
          <div className="sticky top-2 z-20 mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/60 bg-background/95 p-3 shadow-md backdrop-blur">
            <p className="flex items-center gap-2 font-medium text-sm">
              <IconHandFinger
                aria-hidden="true"
                className="size-5 shrink-0 text-primary"
              />
              {pendingPrompt}
            </p>
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'shrink-0'
              )}
              onClick={() => setPendingGroup(undefined)}
            >
              {copy.clearSelectionLabel}
            </button>
          </div>
        ) : null}
        <div className="grid gap-5 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
          <div
            className={cn(
              'grid content-start gap-3 rounded-xl transition-shadow',
              pendingPrompt &&
                'ring-2 ring-primary/50 ring-offset-4 ring-offset-background'
            )}
          >
            <div className="flex min-h-9 items-center justify-between gap-2">
              <div
                className={cn(RUNNER_BOARD_LABEL, 'flex items-center gap-2')}
              >
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
              ({
                action,
                group,
                id,
                pending,
                placedItemViews,
              }: ReturnType<
                typeof buildGroupSortRunnerView
              >['groupViews'][number]) => (
                <div key={id} className="grid content-start gap-2">
                  {/* The whole group, empty drop area included, is one target:
                      tapping it first marks it as the pending group. */}
                  <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={pending}
                    className={cn(
                      RUNNER_TILE,
                      'grid gap-2 bg-muted/50',
                      selectedItemId && !disabled && RUNNER_TARGET_READY,
                      pending && RUNNER_TILE_SELECTED
                    )}
                    onClick={() => handleRunnerAction(action)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{group}</span>
                      <span className="rounded-full bg-background px-2 font-semibold text-muted-foreground text-sm tabular-nums">
                        {placedItemViews.length}
                      </span>
                    </div>
                    {!placedItemViews.length ? (
                      <span
                        aria-hidden="true"
                        className="block min-h-10 rounded-lg border-2 border-dashed border-border/80"
                      />
                    ) : null}
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
                </div>
              )
            )}
          </div>
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
