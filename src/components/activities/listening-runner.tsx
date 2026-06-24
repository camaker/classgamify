import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildSequentialRunnerView,
  buildStudentRunnerView,
  getStudentRunnerReviewStatusClassName,
  isSameRuntimeChoice,
} from '@/assignments/student-runner-view';
import { normalizeListeningSpeechLanguage } from '@/activities/listening-speech';
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
  const [activeItemId, setActiveItemId] = useState(items[0]?.id);
  const [speechSupported, setSpeechSupported] = useState(false);
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
  const sequenceView = buildSequentialRunnerView({
    activeItemId,
    itemLabel: copy.sequenceItemLabel ?? copy.title,
    itemViews: runnerView.itemViews,
  });
  const activeItem = sequenceView.activeItem;

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }, []);

  function playPrompt(prompt: string) {
    if (!speechSupported || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(prompt);
    const speechLanguage = normalizeListeningSpeechLanguage(language);
    if (speechLanguage) {
      utterance.lang = speechLanguage;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if (!activeItem) {
    return null;
  }

  const activeReviewItem = sequenceView.activeItemView.reviewItem;

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
          {sequenceView.itemViews.map((itemView) => {
            const { answered, item, sequenceLabel, status } = itemView;
            const selected = item.id === activeItem.id;

            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'min-h-14 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selected && 'border-primary bg-primary/10',
                  revealAnswer && getStudentRunnerReviewStatusClassName(status)
                )}
                onClick={() => setActiveItemId(item.id)}
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
            revealAnswer &&
              sequenceView.activeItemView &&
              getStudentRunnerReviewStatusClassName(
                sequenceView.activeItemView.status
              )
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
              onClick={() => playPrompt(activeItem.prompt)}
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
            {revealAnswer ? (
              <p className="mt-4 text-base font-semibold leading-7">
                {activeItem.prompt}
              </p>
            ) : null}
          </div>

          {activeItem.choices?.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {activeItem.choices.map((choice) => {
                const selected = isSameRuntimeChoice(
                  answers[activeItem.id],
                  choice
                );

                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      'min-h-10 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors',
                      'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
                      selected && 'border-primary bg-primary/10 text-primary'
                    )}
                    onClick={() => onAnswerChange(activeItem.id, choice)}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <Input
              value={answers[activeItem.id] ?? ''}
              disabled={disabled}
              onChange={(event) =>
                onAnswerChange(activeItem.id, event.target.value)
              }
              placeholder={copy.inputPlaceholder}
              className="mt-4"
            />
          )}

          {revealAnswer && activeReviewItem ? (
            <PublicAnswerFeedback
              correctLabel={copy.correctAnswerLabel}
              reviewItem={activeReviewItem}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
