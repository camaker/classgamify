import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildOpenBoxRevealHandoffView,
  type OpenBoxRevealHandoffView,
} from '@/assignments/open-box-reveal-handoff';
import {
  buildSequentialStudentRunnerView,
  getInitialSequentialStudentRunnerActiveItemId,
  resolveSequentialStudentRunnerActiveItemId,
  resolveSequentialStudentRunnerNavigationAction,
  type SequentialStudentRunnerNavigationAction,
} from '@/assignments/student-runner-view';
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
  const revealHandoffView = useMemo(
    () =>
      buildOpenBoxRevealHandoffView({
        disabled,
        revealAnswer,
        runnerView,
      }),
    [disabled, revealAnswer, runnerView]
  );

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
    return <OpenBoxRevealHandoff view={revealHandoffView} />;
  }

  return (
    <>
      <OpenBoxRevealHandoff view={revealHandoffView} />
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
                  onClick={() => handleNavigationAction(itemView.selectAction)}
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
                  disabled={!navigationView.canMove}
                  onClick={() =>
                    handleNavigationAction(navigationView.nextAction)
                  }
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
    </>
  );
}

function OpenBoxRevealHandoff({ view }: { view: OpenBoxRevealHandoffView }) {
  const titleId = 'open-box-reveal-handoff-title';
  const descriptionId = 'open-box-reveal-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="open-box-reveal-card"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <div data-handoff-item={item.id} key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              <output aria-label={item.ariaLabel}>{item.value}</output>
              <span>{item.description}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
