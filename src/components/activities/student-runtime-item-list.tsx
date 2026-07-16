import type { ActivityTemplateType } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildStudentRuntimeItemListView,
  buildStudentRuntimeSingleAnswerChanges,
  type StudentAnswerChange,
  type StudentRuntimeInteractionHandoffItemView,
  type StudentRuntimeInteractionHandoffView,
  type StudentRuntimeItemListView,
  type StudentRuntimeSemanticBundleHandoffItemView,
  type StudentRuntimeSemanticBundleHandoffView,
} from '@/assignments/student-runtime-item-list';
import type {
  StudentRuntimeChoiceAssignmentHandoffItemView,
  StudentRuntimeChoiceAssignmentHandoffView,
} from '@/assignments/runtime-choice-assignment-handoff';
import type {
  StudentRuntimeIdentityHandoffItemView,
  StudentRuntimeIdentityHandoffView,
} from '@/assignments/runtime-identity-handoff';
import type { RuntimeChoiceButtonView } from '@/assignments/student-runner-view';
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
        <div className="mt-4 grid gap-3">
          {listView.defaultItemCardViews.map((itemView) => (
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
                handleSingleAnswerChange(itemView.item.id, answer)
              }
            />
          ))}
        </div>
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
  return (
    <div data-runtime-surface={listView.surface}>
      <StudentRuntimeSemanticBundleHandoff
        view={listView.semanticBundleHandoffView}
      />
      <StudentRuntimeInteractionHandoff
        view={listView.interactionHandoffView}
      />
      <StudentRuntimeChoiceAssignmentHandoff
        view={listView.runtimeChoiceAssignmentHandoffView}
      />
      <StudentRuntimeIdentityHandoff
        view={listView.runtimeIdentityHandoffView}
      />
      {children}
    </div>
  );
}

function StudentRuntimeSemanticBundleHandoff({
  view,
}: {
  view: StudentRuntimeSemanticBundleHandoffView;
}) {
  const titleId = 'student-runtime-semantic-bundle-handoff-title';
  const descriptionId = 'student-runtime-semantic-bundle-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runtime-semantic-bundle"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRuntimeSemanticBundleHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRuntimeSemanticBundleHandoffItem({
  itemView,
}: {
  itemView: StudentRuntimeSemanticBundleHandoffItemView;
}) {
  const labelId = `student-runtime-semantic-bundle-handoff-${itemView.id}-label`;
  const valueId = `student-runtime-semantic-bundle-handoff-${itemView.id}-value`;
  const descriptionId = `student-runtime-semantic-bundle-handoff-${itemView.id}-description`;

  return (
    <div
      data-handoff-item={itemView.id}
      data-source-handoff={itemView.sourceScope}
      data-source-handoff-item={itemView.sourceItemId}
    >
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}

function StudentRuntimeInteractionHandoff({
  view,
}: {
  view: StudentRuntimeInteractionHandoffView;
}) {
  const titleId = 'student-runtime-interaction-handoff-title';
  const descriptionId = 'student-runtime-interaction-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runtime-interaction"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRuntimeInteractionHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRuntimeInteractionHandoffItem({
  itemView,
}: {
  itemView: StudentRuntimeInteractionHandoffItemView;
}) {
  const labelId = `student-runtime-interaction-handoff-${itemView.id}-label`;
  const valueId = `student-runtime-interaction-handoff-${itemView.id}-value`;
  const descriptionId = `student-runtime-interaction-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}

function StudentRuntimeChoiceAssignmentHandoff({
  view,
}: {
  view: StudentRuntimeChoiceAssignmentHandoffView;
}) {
  const titleId = 'student-runtime-choice-assignment-handoff-title';
  const descriptionId = 'student-runtime-choice-assignment-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runtime-choice-assignment"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRuntimeChoiceAssignmentHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRuntimeChoiceAssignmentHandoffItem({
  itemView,
}: {
  itemView: StudentRuntimeChoiceAssignmentHandoffItemView;
}) {
  const labelId = `student-runtime-choice-assignment-handoff-${itemView.id}-label`;
  const valueId = `student-runtime-choice-assignment-handoff-${itemView.id}-value`;
  const descriptionId = `student-runtime-choice-assignment-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}

function StudentRuntimeIdentityHandoff({
  view,
}: {
  view: StudentRuntimeIdentityHandoffView;
}) {
  const titleId = 'student-runtime-identity-handoff-title';
  const descriptionId = 'student-runtime-identity-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runtime-identity"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRuntimeIdentityHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRuntimeIdentityHandoffItem({
  itemView,
}: {
  itemView: StudentRuntimeIdentityHandoffItemView;
}) {
  const labelId = `student-runtime-identity-handoff-${itemView.id}-label`;
  const valueId = `student-runtime-identity-handoff-${itemView.id}-value`;
  const descriptionId = `student-runtime-identity-handoff-${itemView.id}-description`;

  return (
    <div data-handoff-item={itemView.id}>
      <dt id={labelId}>{itemView.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={itemView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {itemView.value}
        </output>
        <span id={descriptionId}>{itemView.description}</span>
      </dd>
    </div>
  );
}

function assertUnhandledStudentRuntimeItemListSurface(surface: never): never {
  throw new Error(`Unhandled student runtime item-list surface: ${surface}`);
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
  choiceViews: RuntimeChoiceButtonView[];
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
  choices: RuntimeChoiceButtonView[];
  disabled: boolean;
  onAnswerChange: (answer: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {choices.map((choiceView) => {
        return (
          <button
            key={choiceView.id}
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
