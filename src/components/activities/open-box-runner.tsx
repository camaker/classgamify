import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildSequentialStudentRunnerView,
  getInitialSequentialStudentRunnerActiveItemId,
  resolveSequentialStudentRunnerActiveItemId,
  resolveSequentialStudentRunnerNavigationAction,
  type SequentialStudentRunnerNavigationAction,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RUNNER_BOARD_FRAME,
  RUNNER_BOARD_HELP,
} from '@/components/activities/runner-board-styles';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconCheck,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

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
  const [activeItemId, setActiveItemId] = useState(() =>
    getInitialSequentialStudentRunnerActiveItemId(items)
  );
  useEffect(() => {
    setActiveItemId((current) =>
      resolveSequentialStudentRunnerActiveItemId({
        activeItemId: current,
        items,
      })
    );
  }, [items]);
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

  function handleNavigationAction(
    action: SequentialStudentRunnerNavigationAction
  ) {
    setActiveItemId(
      resolveSequentialStudentRunnerNavigationAction({
        action,
        fallbackItemId: activeItemId,
        navigationView,
      })
    );
  }

  if (!activeItem) {
    return null;
  }

  return (
    <div className={RUNNER_BOARD_FRAME}>
      {copy.helpText ? (
        <p className={RUNNER_BOARD_HELP}>{copy.helpText}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
        <div className="grid grid-cols-3 content-start gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {navigationView.itemViews.map((itemView, boxIndex) => {
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
                aria-current={selected ? 'step' : undefined}
                className={cn(
                  'flex aspect-square min-h-16 flex-col items-center justify-center gap-1 rounded-xl p-2 font-semibold text-base text-play-foreground',
                  'shadow-[0_4px_0_rgb(0_0_0/0.18)] transition-[transform,box-shadow,opacity] active:translate-y-0.5 active:shadow-none',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
                  OPEN_BOX_COLORS[boxIndex % OPEN_BOX_COLORS.length],
                  answered && !selected && 'opacity-60',
                  selected &&
                    'ring-4 ring-foreground/75 ring-offset-2 ring-offset-background',
                  reviewStatusClassName && 'ring-2',
                  reviewStatusClassName
                )}
                onClick={() => handleNavigationAction(itemView.selectAction)}
              >
                {answered ? (
                  <IconCheck aria-hidden="true" className="size-6" />
                ) : (
                  <IconBox aria-hidden="true" className="size-6" />
                )}
                <span className="text-sm">{sequenceLabel}</span>
              </button>
            );
          })}
        </div>

        <div
          className={cn(
            'grid content-start gap-5 rounded-xl border-2 p-5',
            navigationView.activePanelStatusClassName
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-muted-foreground text-sm">
              {sequenceView.activeLabel}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={m.student_play_previous()}
                disabled={!navigationView.canMove}
                onClick={() =>
                  handleNavigationAction(navigationView.previousAction)
                }
              >
                <IconArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={m.student_play_next()}
                disabled={!navigationView.canMove}
                onClick={() =>
                  handleNavigationAction(navigationView.nextAction)
                }
              >
                <IconArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <h2 className="text-balance font-bold text-2xl leading-snug">
            {activeItem.prompt}
          </h2>

          <Input
            value={runnerView.activeAnswer}
            disabled={disabled}
            aria-label={activeItem.prompt}
            onChange={(event) =>
              onAnswerChange(activeItem.id, event.target.value)
            }
            placeholder={copy.inputPlaceholder}
            className="h-14 text-lg md:text-lg"
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

const OPEN_BOX_COLORS = [
  'bg-play-1',
  'bg-play-2',
  'bg-play-3',
  'bg-play-4',
] as const;
