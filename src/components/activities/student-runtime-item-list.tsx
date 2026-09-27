import type { ActivityTemplateType } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildStudentRuntimeItemListView,
  buildStudentRuntimeSingleAnswerChanges,
  type StudentAnswerChange,
  type StudentRuntimeItemListView,
} from '@/assignments/student-runtime-item-list';
import { ChoiceQuestionStepper } from '@/components/activities/choice-question-stepper';
import { FillBlankWorksheet } from '@/components/activities/fill-blank-worksheet';
import { GroupSortBoard } from '@/components/activities/group-sort-board';
import { ListeningRunner } from '@/components/activities/listening-runner';
import { LineMatchBoard } from '@/components/activities/line-match-board';
import { MatchingPairsBoard } from '@/components/activities/matching-pairs-board';
import { OpenBoxRunner } from '@/components/activities/open-box-runner';
import type { ReactNode } from 'react';

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
  const listView = buildStudentRuntimeItemListView({
    answers,
    disabled,
    items,
    language,
    revealAnswer,
    reviewItems,
    templateType,
  });

  function handleSingleAnswerChange(itemId: string, answer: string) {
    onAnswerChanges(
      buildStudentRuntimeSingleAnswerChanges({
        answer,
        itemId,
      })
    );
  }

  if (listView.surface === 'line-match') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
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
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'matching-pairs') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
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
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'group-sort') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
        <div className="mt-4">
          <GroupSortBoard
            answers={answers}
            disabled={disabled}
            items={items}
            revealAnswer={revealAnswer}
            reviewItems={reviewItems}
            onAnswerChange={handleSingleAnswerChange}
          />
        </div>
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'fill-blank') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
        <div className="mt-4">
          <FillBlankWorksheet
            answers={answers}
            disabled={disabled}
            items={items}
            revealAnswer={revealAnswer}
            reviewItems={reviewItems}
            onAnswerChange={handleSingleAnswerChange}
          />
        </div>
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'open-box') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
        <div className="mt-4">
          <OpenBoxRunner
            answers={answers}
            disabled={disabled}
            items={items}
            revealAnswer={revealAnswer}
            reviewItems={reviewItems}
            onAnswerChange={handleSingleAnswerChange}
          />
        </div>
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'listening') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
        <div className="mt-4">
          <ListeningRunner
            answers={answers}
            disabled={disabled}
            items={items}
            language={language}
            revealAnswer={revealAnswer}
            reviewItems={reviewItems}
            onAnswerChange={handleSingleAnswerChange}
          />
        </div>
      </StudentRuntimeInteractionRegion>
    );
  }

  if (listView.surface === 'choice-list') {
    return (
      <StudentRuntimeInteractionRegion listView={listView}>
        <ChoiceQuestionStepper
          cardViews={listView.defaultItemCardViews}
          disabled={disabled}
          revealAnswer={revealAnswer}
          reviewMode={Boolean(reviewItems?.length)}
          onAnswerChange={handleSingleAnswerChange}
        />
      </StudentRuntimeInteractionRegion>
    );
  }

  return assertUnhandledStudentRuntimeItemListSurface(listView.surface);
}

function StudentRuntimeInteractionRegion({
  children,
  listView,
}: {
  children: ReactNode;
  listView: StudentRuntimeItemListView;
}) {
  return <div data-runtime-surface={listView.surface}>{children}</div>;
}

function assertUnhandledStudentRuntimeItemListSurface(surface: never): never {
  throw new Error(`Unhandled student runtime item-list surface: ${surface}`);
}
