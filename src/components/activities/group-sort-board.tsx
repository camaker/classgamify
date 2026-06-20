import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { getUniqueRuntimeChoices } from '@/components/activities/runtime-item-choices';
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
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const groups = useMemo(() => getUniqueRuntimeChoices(items), [items]);
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  );
  const reviewByItemId = useMemo(
    () =>
      new Map(
        reviewItems?.map((reviewItem) => [reviewItem.itemId, reviewItem]) ?? []
      ),
    [reviewItems]
  );
  const selectedItem = selectedItemId ? itemsById.get(selectedItemId) : null;
  const unplacedItems = items.filter((item) => !answers[item.id]?.trim());

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
          Group sort
        </div>
        <Badge variant="outline" className="rounded-md">
          {items.filter((item) => answers[item.id]?.trim()).length}/
          {items.length} sorted
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
            {unplacedItems.length ? (
              unplacedItems.map((item) => (
                <GroupSortItemButton
                  key={item.id}
                  item={item}
                  reviewItem={reviewByItemId.get(item.id)}
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
          {groups.map((group) => {
            const placedItems = items.filter(
              (item) => answers[item.id] === group
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
                      {placedItems.length}
                    </Badge>
                  </div>
                </button>

                <div className="mt-3 grid gap-2">
                  {placedItems.map((item) => (
                    <GroupSortItemButton
                      key={item.id}
                      item={item}
                      reviewItem={reviewByItemId.get(item.id)}
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
                  {!placedItems.length ? (
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
  disabled,
  item,
  onSelect,
  revealAnswer,
  reviewItem,
  selected,
}: {
  compact?: boolean;
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
          correctLabel="Correct group"
          reviewItem={reviewItem}
        />
      ) : null}
    </button>
  );
}
