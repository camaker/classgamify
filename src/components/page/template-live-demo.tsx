import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';
import {
  buildPublicAttemptReviewItems,
  stripRuntimeAnswers,
} from '@/assignments/public';
import {
  applyStudentAnswerChanges,
  type StudentAnswerMap,
} from '@/assignments/student-submission';
import { StudentRuntimeItemList } from '@/components/activities/student-runtime-item-list';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  buildTemplateDemo,
  getTemplateDemoInput,
  type TemplateDemoField,
} from '@/pages/template-live-demo';
import { useId, useState } from 'react';

const FIELD_HELP: Record<TemplateDemoField, string> = {
  groupsText: 'One group per line: Group name | item, item, item',
  pairsText: 'One pair per line: term | matching answer',
  questionsText:
    'One per line: prompt | answer | choices separated by commas | explanation',
};

/**
 * Playable example on a template guide. The teacher edits the sample rows, the
 * page builds the activity with the same parser and runner students use, and
 * scores it locally. Nothing is saved or sent.
 */
export function TemplateLiveDemo({
  templateType,
}: {
  templateType: ActivityTemplateType;
}) {
  const textId = useId();
  const input = getTemplateDemoInput(
    templateType,
    getActivityTemplateScaffold(templateType)
  );
  const [text, setText] = useState(input.text);
  const [demo, setDemo] = useState(() =>
    buildTemplateDemo({ templateType, text: input.text })
  );
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswerMap>({});
  const [checked, setChecked] = useState(false);

  function restart(nextDemo = demo) {
    setDemo(nextDemo);
    setAnswers({});
    setChecked(false);
    setRound((current) => current + 1);
  }

  const evaluation =
    checked && demo.status === 'ready'
      ? evaluateRuntimeAnswers({
          answers: Object.entries(answers).map(([itemId, answer]) => ({
            answer,
            itemId,
          })),
          content: demo.content,
          templateType,
        })
      : undefined;
  const reviewItems =
    evaluation && demo.status === 'ready'
      ? buildPublicAttemptReviewItems({
          answers: evaluation.answers,
          runtimeItems: getRuntimeItems(templateType, demo.content),
          showCorrectAnswers: true,
        })
      : undefined;
  const correct = evaluation?.answers.filter((answer) => answer.correct).length;

  return (
    <div className="grid gap-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <label className="font-semibold text-sm" htmlFor={textId}>
          Your rows
        </label>
        <p className="text-muted-foreground text-sm">
          {FIELD_HELP[input.field]}
        </p>
        <Textarea
          id={textId}
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <Button
          type="button"
          className="w-fit"
          onClick={() => restart(buildTemplateDemo({ templateType, text }))}
        >
          Play with my rows
        </Button>
      </div>

      {demo.status === 'invalid' ? (
        <p className="text-destructive text-sm" role="alert">
          {demo.message}
        </p>
      ) : (
        <div className="grid gap-4">
          <StudentRuntimeItemList
            key={round}
            promptAsParagraph
            answers={answers}
            disabled={checked}
            items={stripRuntimeAnswers(
              getRuntimeItems(templateType, demo.content)
            )}
            language={demo.content.language}
            revealAnswer={checked}
            reviewItems={reviewItems}
            templateType={templateType}
            onAnswerChanges={(changes) =>
              setAnswers((current) =>
                applyStudentAnswerChanges({ answers: current, changes })
              )
            }
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={checked}
              onClick={() => setChecked(true)}
            >
              Check answers
            </Button>
            <Button type="button" variant="ghost" onClick={() => restart()}>
              Start over
            </Button>
            {evaluation ? (
              <output className="font-semibold text-sm">
                {correct} of {evaluation.answers.length} correct
              </output>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
