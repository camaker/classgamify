import type { DefaultRuntimeItemCardView } from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { m } from '@/locale/paraglide/messages';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const ANSWER_TILE_COLORS = [
  'bg-play-1',
  'bg-play-2',
  'bg-play-3',
  'bg-play-4',
] as const;
const ANSWER_TILE_LETTERS = 'ABCDEFGHIJKL';
const AUTO_ADVANCE_DELAY_MS = 450;

type ChoiceQuestionStepperProps = {
  cardViews: DefaultRuntimeItemCardView[];
  disabled: boolean;
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewMode: boolean;
};

/**
 * Quiz and match-up runner: one question per screen with large answer tiles.
 * Choosing an answer moves on to the next question. After submission every
 * question is listed so students can review their answers.
 */
export function ChoiceQuestionStepper({
  cardViews,
  disabled,
  onAnswerChange,
  revealAnswer,
  reviewMode,
}: ChoiceQuestionStepperProps) {
  const [index, setIndex] = useState(0);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const total = cardViews.length;
  const current = Math.min(index, Math.max(total - 1, 0));
  const answeredCount = cardViews.filter(
    (cardView) => cardView.answered
  ).length;

  useEffect(() => {
    return () => window.clearTimeout(advanceTimerRef.current);
  }, []);

  // A fresh attempt clears every answer: start again from question one.
  useEffect(() => {
    if (answeredCount === 0) setIndex(0);
  }, [answeredCount]);

  if (total === 0) return null;

  if (reviewMode) {
    return (
      <div className="grid gap-4">
        {cardViews.map((cardView, cardIndex) => (
          <ChoiceQuestionCard
            cardView={cardView}
            disabled={disabled}
            key={cardView.item.id}
            position={cardIndex + 1}
            revealAnswer={revealAnswer}
            reviewMode
            total={total}
            onAnswer={(answer) => onAnswerChange(cardView.item.id, answer)}
          />
        ))}
      </div>
    );
  }

  const cardView = cardViews[current];

  function goTo(nextIndex: number) {
    window.clearTimeout(advanceTimerRef.current);
    setIndex(Math.min(Math.max(nextIndex, 0), total - 1));
  }

  function handleAnswer(answer: string) {
    onAnswerChange(cardView.item.id, answer);
    if (!cardView.showChoices || current >= total - 1) return;

    window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => {
      setIndex(current + 1);
    }, AUTO_ADVANCE_DELAY_MS);
  }

  return (
    <div className="grid gap-4">
      <ChoiceQuestionCard
        cardView={cardView}
        disabled={disabled}
        key={cardView.item.id}
        position={current + 1}
        revealAnswer={revealAnswer}
        total={total}
        onAnswer={handleAnswer}
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
        >
          <IconArrowLeft className="size-4" />
          {m.student_play_previous()}
        </Button>
        <ol className="flex flex-wrap justify-center">
          {cardViews.map((dotCardView, dotIndex) => (
            <li key={dotCardView.item.id}>
              <button
                type="button"
                aria-current={dotIndex === current ? 'step' : undefined}
                aria-label={m.student_play_go_to_question({
                  number: dotIndex + 1,
                })}
                className="flex size-7 items-center justify-center rounded-full"
                onClick={() => goTo(dotIndex)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block size-2.5 rounded-full transition-colors',
                    dotIndex === current
                      ? 'size-3 bg-primary'
                      : dotCardView.answered
                        ? 'bg-primary/45'
                        : 'bg-muted-foreground/25'
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={current === total - 1}
          onClick={() => goTo(current + 1)}
        >
          {m.student_play_next()}
          <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ChoiceQuestionCard({
  cardView,
  disabled,
  onAnswer,
  position,
  revealAnswer,
  reviewMode = false,
  total,
}: {
  cardView: DefaultRuntimeItemCardView;
  disabled: boolean;
  onAnswer: (answer: string) => void;
  position: number;
  revealAnswer: boolean;
  reviewMode?: boolean;
  total: number;
}) {
  // In review, only the student's own answer keeps its color.
  const dimUnselected =
    reviewMode ||
    cardView.choiceViews.some((choiceView) => choiceView.selected);

  return (
    <article
      aria-label={cardView.positionLabel}
      className="grid gap-6 rounded-2xl border bg-background p-5 shadow-sm md:p-8"
    >
      <div className="grid gap-2">
        <p className="font-semibold text-muted-foreground text-sm">
          {m.student_play_question_position({ current: position, total })}
        </p>
        <h2 className="text-balance font-bold text-2xl leading-snug md:text-3xl">
          {cardView.prompt}
        </h2>
      </div>

      {cardView.showChoices ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cardView.choiceViews.map((choiceView, choiceIndex) => (
            <button
              key={choiceView.id}
              type="button"
              disabled={disabled}
              aria-pressed={choiceView.selected}
              className={cn(
                'flex min-h-16 items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-lg text-play-foreground',
                'shadow-[0_4px_0_rgb(0_0_0/0.18)] transition-[transform,box-shadow,opacity]',
                'hover:brightness-110 active:translate-y-0.5 active:shadow-none',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60',
                'disabled:cursor-default disabled:hover:brightness-100',
                ANSWER_TILE_COLORS[choiceIndex % ANSWER_TILE_COLORS.length],
                dimUnselected && !choiceView.selected && 'opacity-40',
                choiceView.selected &&
                  'ring-4 ring-foreground/75 ring-offset-2 ring-offset-background'
              )}
              onClick={() => onAnswer(choiceView.choice)}
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-base"
              >
                {ANSWER_TILE_LETTERS[choiceIndex] ?? ''}
              </span>
              <span className="min-w-0 flex-1 break-words">
                {choiceView.choice}
              </span>
              {choiceView.selected ? (
                <IconCircleCheckFilled
                  aria-hidden="true"
                  className="size-6 shrink-0"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <Input
          value={cardView.answer}
          disabled={disabled}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder={cardView.inputPlaceholder}
          aria-label={cardView.prompt}
          className="h-14 text-lg md:text-lg"
        />
      )}

      {revealAnswer && cardView.reviewItem ? (
        <PublicAnswerFeedback
          correctLabel={cardView.correctAnswerLabel}
          reviewItem={cardView.reviewItem}
        />
      ) : null}
    </article>
  );
}
