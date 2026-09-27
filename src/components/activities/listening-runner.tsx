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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RUNNER_BOARD_FRAME,
  RUNNER_BOARD_HELP,
  RUNNER_TILE,
  RUNNER_TILE_ANSWERED,
  RUNNER_TILE_SELECTED,
} from '@/components/activities/runner-board-styles';
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
            speechSupported,
          })
        : undefined,
    [activeItem, language, revealAnswer, speechSupported]
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

  const panelId = `listening-panel-${activeItem.id}`;
  const helpId = `${panelId}-help`;
  const statusId = `${panelId}-status`;
  const playDescriptionId = `${panelId}-play-description`;
  const inputDescriptionId = `${panelId}-input-description`;
  const describedBy = `${helpId} ${statusId}`;

  return (
    <div className={RUNNER_BOARD_FRAME}>
      <div className="grid gap-5 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
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
                aria-current={selected ? 'step' : undefined}
                className={cn(
                  RUNNER_TILE,
                  answered && RUNNER_TILE_ANSWERED,
                  selected && RUNNER_TILE_SELECTED,
                  reviewStatusClassName
                )}
                onClick={() => handleNavigationAction(itemView.selectAction)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{sequenceLabel}</span>
                  {answered ? (
                    <IconCheck
                      aria-hidden="true"
                      className="size-5 shrink-0 text-primary"
                    />
                  ) : (
                    <IconVolume
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground"
                    />
                  )}
                </div>
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
          <p className="font-semibold text-muted-foreground text-sm">
            {sequenceView.activeLabel}
          </p>

          <Button
            type="button"
            size="lg"
            className="h-16 w-full text-lg sm:w-fit sm:px-8"
            aria-describedby={`${playDescriptionId} ${describedBy}`}
            disabled={!speechSupported}
            onClick={playPrompt}
          >
            {speechSupported ? (
              <IconPlayerPlay className="size-6" />
            ) : (
              <IconVolumeOff className="size-6" />
            )}
            {copy.playAudioLabel}
          </Button>

          <p id={playDescriptionId} className="sr-only">
            {
              activePromptView?.statusItemViews.find(
                (itemView) => itemView.id === 'speech'
              )?.description
            }
          </p>

          <p id={helpId} className={RUNNER_BOARD_HELP}>
            {copy.helpText}
          </p>

          {activePromptView ? (
            <dl
              id={statusId}
              aria-label={copy.listeningReadinessLabel}
              className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm"
            >
              {activePromptView.statusItemViews.map((itemView) => (
                <div key={itemView.id} className="flex gap-1">
                  <dt>{itemView.label}:</dt>
                  <dd className="font-medium text-foreground">
                    {itemView.value}
                  </dd>
                  <dd className="sr-only">{itemView.description}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {activePromptView?.transcriptText ? (
            <p className="rounded-lg bg-muted/50 p-4 font-semibold text-lg leading-8">
              {activePromptView.transcriptText}
            </p>
          ) : null}

          {runnerView.activeChoiceViews.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {runnerView.activeChoiceViews.map((choiceView) => {
                return (
                  <button
                    key={choiceView.id}
                    type="button"
                    disabled={disabled}
                    className={cn(
                      RUNNER_TILE,
                      choiceView.selected && RUNNER_TILE_SELECTED
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
              aria-describedby={`${inputDescriptionId} ${describedBy}`}
              onChange={(event) =>
                onAnswerChange(activeItem.id, event.target.value)
              }
              placeholder={copy.inputPlaceholder}
              className="h-14 text-lg md:text-lg"
            />
          )}

          <p id={inputDescriptionId} className="sr-only">
            {
              activePromptView?.statusItemViews.find(
                (itemView) => itemView.id === 'transcript'
              )?.description
            }
          </p>

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
