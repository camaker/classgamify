import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  getAttemptCompletionSummary,
  isStudentAnswerFilled,
} from '@/assignments/student-submission';
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
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function ListeningRunner({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: ListeningRunnerProps) {
  const [activeItemId, setActiveItemId] = useState(items[0]?.id);
  const [speechSupported, setSpeechSupported] = useState(false);
  const reviewByItemId = useMemo(
    () =>
      new Map(
        reviewItems?.map((reviewItem) => [reviewItem.itemId, reviewItem]) ?? []
      ),
    [reviewItems]
  );
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeItemId)
  );
  const activeItem = items[activeIndex] ?? items[0];
  const completionSummary = getAttemptCompletionSummary({
    answers,
    runtimeItems: items,
  });

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

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(prompt));
  }

  if (!activeItem) {
    return null;
  }

  const activeReviewItem = reviewByItemId.get(activeItem.id);

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconVolume className="size-4 text-primary" />
          Listening
        </div>
        <Badge variant="outline" className="rounded-md">
          {completionSummary.answeredItemCount}/{completionSummary.itemCount}{' '}
          answered
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          {items.map((item, index) => {
            const selected = item.id === activeItem.id;
            const answered = isStudentAnswerFilled(answers[item.id]);
            const reviewItem = reviewByItemId.get(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'min-h-14 rounded-lg border bg-background p-3 text-left transition-colors',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selected && 'border-primary bg-primary/10',
                  revealAnswer &&
                    reviewItem?.correct &&
                    'border-primary/35 bg-primary/5',
                  revealAnswer &&
                    reviewItem &&
                    !reviewItem.correct &&
                    'border-destructive/30 bg-destructive/5'
                )}
                onClick={() => setActiveItemId(item.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Track {index + 1}</span>
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
              activeReviewItem?.correct &&
              'border-primary/35 bg-primary/5',
            revealAnswer &&
              activeReviewItem &&
              !activeReviewItem.correct &&
              'border-destructive/30 bg-destructive/5'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="rounded-md">
              Track {activeIndex + 1}
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
              Play audio
            </Button>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Listen first
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the play button, then answer what you heard.
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
                const selected = answers[activeItem.id] === choice;

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
              placeholder="Type what you heard"
              className="mt-4"
            />
          )}

          {revealAnswer && activeReviewItem ? (
            <PublicAnswerFeedback reviewItem={activeReviewItem} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
