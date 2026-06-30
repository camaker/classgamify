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
import { buildListeningPromptView } from '@/activities/listening-speech';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconPlayerPlay,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

type ListeningRunnerProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function ListeningRunner({
  answers,
  disabled,
  items,
  language,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: ListeningRunnerProps) {
  const copy = getActivityRunnerKindCopy('listening');
  const [activeItemId, setActiveItemId] = useState(() =>
    getInitialSequentialStudentRunnerActiveItemId(items)
  );
  const [speechSupported, setSpeechSupported] = useState(false);
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

  const activePromptView = useMemo(
    () =>
      activeItem
        ? buildListeningPromptView({
            language,
            prompt: activeItem.prompt,
            revealAnswer,
          })
        : undefined,
    [activeItem, language, revealAnswer]
  );

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }, []);

  function playPrompt() {
    if (
      !activePromptView ||
      !speechSupported ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(activePromptView.speechText);
    if (activePromptView.speechLanguage) {
      utterance.lang = activePromptView.speechLanguage;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if (!activeItem) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconVolume className="size-4 text-primary" />
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
                    <IconVolume className="size-4 text-muted-foreground" />
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
            <Button
              type="button"
              variant="outline"
              disabled={!speechSupported}
              onClick={playPrompt}
            >
              {speechSupported ? (
                <IconPlayerPlay className="size-4" />
              ) : (
                <IconVolumeOff className="size-4" />
              )}
              {copy.playAudioLabel}
            </Button>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {copy.listeningPromptLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.helpText}
            </p>
            {activePromptView?.transcriptText ? (
              <p className="mt-4 text-base font-semibold leading-7">
                {activePromptView.transcriptText}
              </p>
            ) : null}
          </div>

          {runnerView.activeChoiceViews.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {runnerView.activeChoiceViews.map((choiceView) => {
                return (
                  <button
                    key={choiceView.choice}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      'min-h-10 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors',
                      'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                      choiceView.selected &&
                        'border-primary bg-primary/10 text-primary'
                    )}
                    onClick={() =>
                      onAnswerChange(activeItem.id, choiceView.choice)
                    }
                  >
                    {choiceView.choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <Input
              value={runnerView.activeAnswer}
              disabled={disabled}
              onChange={(event) =>
                onAnswerChange(activeItem.id, event.target.value)
              }
              placeholder={copy.inputPlaceholder}
              className="mt-4"
            />
          )}

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
