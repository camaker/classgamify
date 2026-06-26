import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import { buildSequentialStudentRunnerView } from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconCheck,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

type OpenBoxRunnerProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function OpenBoxRunner({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: OpenBoxRunnerProps) {
  const copy = getActivityRunnerKindCopy('open-box');
  const [activeItemId, setActiveItemId] = useState(items[0]?.id);
  const runnerView = useMemo(
    () =>
      buildSequentialStudentRunnerView({
        activeItemId,
        answers,
        itemLabel: copy.sequenceItemLabel ?? copy.title,
        items,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
      }),
    [
      activeItemId,
      answers,
      copy.progressVerb,
      copy.sequenceItemLabel,
      copy.title,
      items,
      revealAnswer,
      reviewItems,
    ]
  );
  const { activeItem, navigationView, sequenceView } = runnerView;

  if (!activeItem) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconBox className="size-4 text-primary" />
          {copy.title}
        </div>
        <Badge variant="outline" className="rounded-md">
          {runnerView.progressLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          {navigationView.itemViews.map((itemView) => {
            const {
              answered,
              item,
              reviewStatusClassName,
              selected,
              sequenceLabel,
            } = itemView;

            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'min-h-14 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selected && 'border-primary bg-primary/10',
                  reviewStatusClassName
                )}
                onClick={() => setActiveItemId(item.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{sequenceLabel}</span>
                  {answered ? (
                    <IconCheck className="size-4 text-primary" />
                  ) : (
                    <IconBox className="size-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'rounded-lg border bg-background p-4',
            navigationView.activePanelStatusClassName
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="rounded-md">
              {sequenceView.activeLabel}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!navigationView.canMove}
                onClick={() => setActiveItemId(navigationView.previousItemId)}
              >
                <IconArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!navigationView.canMove}
                onClick={() => setActiveItemId(navigationView.nextItemId)}
              >
                <IconArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/20 p-4">
            <p className="text-base font-semibold leading-7">
              {activeItem.prompt}
            </p>
          </div>

          <Input
            value={runnerView.activeAnswer}
            disabled={disabled}
            onChange={(event) =>
              onAnswerChange(activeItem.id, event.target.value)
            }
            placeholder={copy.inputPlaceholder}
            className="mt-4"
          />

          {revealAnswer && runnerView.activeReviewItem ? (
            <PublicAnswerFeedback
              correctLabel={copy.correctAnswerLabel}
              reviewItem={runnerView.activeReviewItem}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
