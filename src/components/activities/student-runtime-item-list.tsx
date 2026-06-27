import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import { getActivityTemplateRunnerKind } from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { buildDefaultRuntimeItemCardViews } from '@/assignments/student-runner-view';
import {
  buildStudentAnswerChanges,
  type StudentAnswerChange,
} from '@/assignments/student-submission';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { FillBlankWorksheet } from '@/components/activities/fill-blank-worksheet';
import { GroupSortBoard } from '@/components/activities/group-sort-board';
import { ListeningRunner } from '@/components/activities/listening-runner';
import { LineMatchBoard } from '@/components/activities/line-match-board';
import { MatchingPairsBoard } from '@/components/activities/matching-pairs-board';
import { OpenBoxRunner } from '@/components/activities/open-box-runner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StudentRuntimeItemListProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  language?: string;
  onAnswerChanges: (changes: StudentAnswerChange[]) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
};

export function StudentRuntimeItemList({
  answers,
  disabled,
  items,
  language,
  onAnswerChanges,
  revealAnswer,
  reviewItems,
  templateType,
}: StudentRuntimeItemListProps) {
  const runnerKind = getActivityTemplateRunnerKind(templateType);
  const runnerCopy = getActivityTemplateRunnerCopy(templateType);
  const itemCardViews = buildDefaultRuntimeItemCardViews({
    answers,
    correctAnswerLabel: runnerCopy.correctAnswerLabel,
    inputPlaceholder: runnerCopy.inputPlaceholder,
    items,
    reviewItems,
  });

  if (runnerKind === 'line-match') {
    return (
      <div className="mt-4">
        <LineMatchBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChanges={onAnswerChanges}
        />
      </div>
    );
  }

  if (runnerKind === 'matching-pairs') {
    return (
      <div className="mt-4">
        <MatchingPairsBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChanges={onAnswerChanges}
        />
      </div>
    );
  }

  if (runnerKind === 'group-sort') {
    return (
      <div className="mt-4">
        <GroupSortBoard
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={(itemId, answer) =>
            onAnswerChanges(buildStudentAnswerChanges({ answer, itemId }))
          }
        />
      </div>
    );
  }

  if (runnerKind === 'fill-blank') {
    return (
      <div className="mt-4">
        <FillBlankWorksheet
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={(itemId, answer) =>
            onAnswerChanges(buildStudentAnswerChanges({ answer, itemId }))
          }
        />
      </div>
    );
  }

  if (runnerKind === 'open-box') {
    return (
      <div className="mt-4">
        <OpenBoxRunner
          answers={answers}
          disabled={disabled}
          items={items}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={(itemId, answer) =>
            onAnswerChanges(buildStudentAnswerChanges({ answer, itemId }))
          }
        />
      </div>
    );
  }

  if (runnerKind === 'listening') {
    return (
      <div className="mt-4">
        <ListeningRunner
          answers={answers}
          disabled={disabled}
          items={items}
          language={language}
          revealAnswer={revealAnswer}
          reviewItems={reviewItems}
          onAnswerChange={(itemId, answer) =>
            onAnswerChanges(buildStudentAnswerChanges({ answer, itemId }))
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {itemCardViews.map((itemView) => (
        <RuntimeItemCard
          key={itemView.item.id}
          answer={itemView.answer}
          choiceViews={itemView.choiceViews}
          correctAnswerLabel={itemView.correctAnswerLabel}
          disabled={disabled}
          inputPlaceholder={itemView.inputPlaceholder}
          kindLabel={itemView.kindLabel}
          positionLabel={itemView.positionLabel}
          reviewItem={itemView.reviewItem}
          revealAnswer={revealAnswer}
          showChoices={itemView.showChoices}
          onAnswerChange={(answer) =>
            onAnswerChanges(
              buildStudentAnswerChanges({
                answer,
                itemId: itemView.item.id,
              })
            )
          }
        />
      ))}
    </div>
  );
}

function RuntimeItemCard({
  answer,
  choiceViews,
  correctAnswerLabel,
  disabled,
  inputPlaceholder,
  kindLabel,
  onAnswerChange,
  positionLabel,
  revealAnswer,
  reviewItem,
  showChoices,
}: {
  answer: string;
  choiceViews: ReturnType<
    typeof buildDefaultRuntimeItemCardViews
  >[number]['choiceViews'];
  correctAnswerLabel: string;
  disabled: boolean;
  inputPlaceholder: string;
  kindLabel: string;
  onAnswerChange: (answer: string) => void;
  positionLabel: string;
  revealAnswer: boolean;
  reviewItem?: PublicAttemptReviewItem;
  showChoices: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">{positionLabel}</p>
        <Badge variant="outline" className="rounded-md">
          {kindLabel}
        </Badge>
      </div>
      {showChoices ? (
        <ChoiceGrid
          choices={choiceViews}
          disabled={disabled}
          onAnswerChange={onAnswerChange}
        />
      ) : (
        <Input
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={inputPlaceholder}
          className="mt-3"
        />
      )}
      {revealAnswer && reviewItem ? (
        <PublicAnswerFeedback
          correctLabel={correctAnswerLabel}
          reviewItem={reviewItem}
        />
      ) : null}
    </div>
  );
}

function ChoiceGrid({
  choices,
  disabled,
  onAnswerChange,
}: {
  choices: ReturnType<
    typeof buildDefaultRuntimeItemCardViews
  >[number]['choiceViews'];
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {choices.map((choiceView) => {
        return (
          <button
            key={choiceView.choice}
            type="button"
            disabled={disabled}
            className={cn(
              'min-h-10 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors',
              'hover:border-primary/50 hover:bg-primary/5 disabled:cursor-default disabled:opacity-100',
              choiceView.selected && 'border-primary bg-primary/10 text-primary'
            )}
            onClick={() => onAnswerChange(choiceView.choice)}
          >
            {choiceView.choice}
          </button>
        );
      })}
    </div>
  );
}
