import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { getActivityRunnerKindCopy } from '@/activities/runner-copy';
import {
  buildFillBlankWorksheetHandoffView,
  type FillBlankWorksheetHandoffItemView,
  type FillBlankWorksheetHandoffView,
} from '@/assignments/fill-blank-worksheet-handoff';
import {
  buildFillBlankWorksheetView,
  type InlineBlankPromptView,
} from '@/assignments/student-runner-view';
import { PublicAnswerFeedback } from '@/components/activities/public-answer-feedback';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconPencil } from '@tabler/icons-react';
import { useMemo } from 'react';

type FillBlankWorksheetProps = {
  answers: Record<string, string>;
  disabled: boolean;
  items: PublicRuntimeItem[];
  onAnswerChange: (itemId: string, answer: string) => void;
  revealAnswer: boolean;
  reviewItems?: PublicAttemptReviewItem[];
};

export function FillBlankWorksheet({
  answers,
  disabled,
  items,
  onAnswerChange,
  revealAnswer,
  reviewItems,
}: FillBlankWorksheetProps) {
  const copy = getActivityRunnerKindCopy('fill-blank');
  const runnerView = useMemo(
    () =>
      buildFillBlankWorksheetView({
        answers,
        items,
        progressVerb: copy.progressVerb,
        revealAnswer,
        reviewItems,
        wordBankLabel: copy.wordBankLabel,
      }),
    [
      answers,
      copy.progressVerb,
      copy.wordBankLabel,
      items,
      revealAnswer,
      reviewItems,
    ]
  );
  const handoffView = useMemo(
    () =>
      buildFillBlankWorksheetHandoffView({
        disabled,
        revealAnswer,
        runnerView,
      }),
    [disabled, revealAnswer, runnerView]
  );

  return (
    <>
      <FillBlankWorksheetHandoff view={handoffView} />
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconPencil className="size-4 text-primary" />
            {copy.title}
          </div>
          <Badge variant="outline" className="rounded-md">
            {runnerView.progressLabel}
          </Badge>
        </div>

        <div className="mt-3 grid gap-3">
          {runnerView.fillBlankItemViews.map((itemView) => {
            const { answer, item, promptView, reviewItem } = itemView;

            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-lg border bg-background p-3',
                  itemView.reviewStatusClassName
                )}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="rounded-md">
                    {itemView.sequenceLabel}
                  </Badge>
                  {itemView.wordBankLineText ? (
                    <p className="text-xs text-muted-foreground">
                      {itemView.wordBankLineText}
                    </p>
                  ) : null}
                </div>
                <InlineBlankPrompt
                  answer={answer}
                  disabled={disabled}
                  inlinePlaceholder={
                    copy.inlineBlankPlaceholder ?? copy.inputPlaceholder
                  }
                  placeholder={copy.inputPlaceholder}
                  promptView={promptView}
                  onAnswerChange={(answer) => onAnswerChange(item.id, answer)}
                />
                {revealAnswer && reviewItem ? (
                  <PublicAnswerFeedback
                    correctLabel={copy.correctAnswerLabel}
                    reviewItem={reviewItem}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FillBlankWorksheetHandoff({
  view,
}: {
  view: FillBlankWorksheetHandoffView;
}) {
  const titleId = 'fill-blank-worksheet-handoff-title';
  const descriptionId = 'fill-blank-worksheet-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="fill-blank-worksheet"
      data-handoff-scope={view.privacy.scope}
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((item) => (
          <FillBlankWorksheetHandoffItem item={item} key={item.id} />
        ))}
      </dl>
    </section>
  );
}

function FillBlankWorksheetHandoffItem({
  item,
}: {
  item: FillBlankWorksheetHandoffItemView;
}) {
  const labelId = `fill-blank-worksheet-handoff-${item.id}-label`;
  const valueId = `fill-blank-worksheet-handoff-${item.id}-value`;
  const descriptionId = `fill-blank-worksheet-handoff-${item.id}-description`;

  return (
    <div data-handoff-item={item.id}>
      <dt id={labelId}>{item.label}</dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={item.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {item.value}
        </output>
        <span id={descriptionId}>{item.description}</span>
      </dd>
    </div>
  );
}

function InlineBlankPrompt({
  answer,
  disabled,
  onAnswerChange,
  inlinePlaceholder,
  placeholder,
  promptView,
}: {
  answer: string;
  disabled: boolean;
  inlinePlaceholder: string;
  onAnswerChange: (answer: string) => void;
  placeholder: string;
  promptView: InlineBlankPromptView;
}) {
  if (promptView.mode === 'standalone') {
    return (
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-center">
        <p className="text-sm font-medium leading-7">{promptView.prompt}</p>
        <Input
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium leading-8">
      <span>{promptView.before}</span>
      <Input
        value={answer}
        disabled={disabled}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder={inlinePlaceholder}
        className="h-9 w-40 min-w-0 border-x-0 border-t-0 rounded-none bg-transparent px-2 text-center shadow-none focus-visible:ring-0"
      />
      <span>{promptView.after}</span>
    </div>
  );
}
