import type { StudentRunnerControlView } from '@/assignments/student-runner-state';
import {
  buildStudentRunnerSubmitControlsHandoffView,
  type StudentRunnerSubmitControlsHandoffItemView,
  type StudentRunnerSubmitControlsHandoffView,
} from '@/assignments/student-runner-submit-controls-handoff';
import { Button } from '@/components/ui/button';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';

type StudentRunnerSubmitControlsProps = {
  controlView: StudentRunnerControlView;
  onSubmit: () => void;
};

type StudentRunnerSubmitReadinessView =
  StudentRunnerControlView['submitReadinessView'];
type StudentRunnerSubmitReadinessItemView =
  StudentRunnerSubmitReadinessView['items'][number];

export function StudentRunnerSubmitControls({
  controlView,
  onSubmit,
}: StudentRunnerSubmitControlsProps) {
  const submitControlsHandoffView =
    buildStudentRunnerSubmitControlsHandoffView(controlView);
  const submitHintIds = controlView.submitHintViews.map((hintView) =>
    buildStudentRunnerSubmitHintId(hintView.id)
  );
  const submitControlsLabelId = 'student-runner-submit-controls-label';
  const readinessDescriptionId = 'student-runner-submit-readiness-description';
  const payloadSummaryDescriptionId =
    'student-runner-submit-payload-summary-description';
  const buttonDescriptionIds = [
    readinessDescriptionId,
    payloadSummaryDescriptionId,
    ...submitHintIds,
  ];

  return (
    <section aria-labelledby={submitControlsLabelId} className="mt-4">
      <h2 id={submitControlsLabelId} className="sr-only">
        {controlView.submitControlsLabel}
      </h2>
      <StudentRunnerSubmitReadiness
        view={controlView.submitReadinessView}
        descriptionId={readinessDescriptionId}
      />
      <fieldset
        aria-label={controlView.payloadSummaryView.ariaLabel}
        aria-describedby={payloadSummaryDescriptionId}
        className="mb-4 rounded-md border bg-muted/20 p-4"
      >
        <legend className="text-sm font-medium">
          {controlView.payloadSummaryView.title}
        </legend>
        <p
          id={payloadSummaryDescriptionId}
          className="mt-1 text-xs text-muted-foreground"
        >
          {controlView.payloadSummaryView.description}
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {controlView.payloadSummaryView.metrics.map((metric) => (
            <div key={metric.key} className="space-y-1">
              <dt
                id={buildStudentRunnerPayloadMetricLabelId(metric.key)}
                className="text-xs font-medium text-muted-foreground"
              >
                {metric.label}
              </dt>
              <dd className="space-y-1">
                <output
                  aria-describedby={buildStudentRunnerPayloadMetricDescriptionId(
                    metric.key
                  )}
                  aria-label={metric.ariaLabel}
                  aria-labelledby={`${buildStudentRunnerPayloadMetricLabelId(
                    metric.key
                  )} ${buildStudentRunnerPayloadMetricValueId(metric.key)}`}
                  className="block text-sm font-semibold text-foreground"
                  id={buildStudentRunnerPayloadMetricValueId(metric.key)}
                >
                  {metric.value}
                </output>
                <p
                  id={buildStudentRunnerPayloadMetricDescriptionId(metric.key)}
                  className="text-xs text-muted-foreground"
                >
                  {metric.description}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </fieldset>
      <Button
        type="button"
        className="w-full sm:w-fit"
        data-confirm-incomplete={
          controlView.requiresIncompleteSubmitConfirmation ? true : undefined
        }
        disabled={controlView.submitDisabled}
        aria-label={controlView.submitButtonAriaLabel}
        aria-describedby={buttonDescriptionIds.join(' ')}
        onClick={onSubmit}
      >
        <IconCheck className="size-4" />
        {controlView.submitButtonLabel}
      </Button>
      {controlView.submitHintViews.map((hintView) => (
        <StudentRunnerSubmitHint
          id={buildStudentRunnerSubmitHintId(hintView.id)}
          key={hintView.id}
          ariaLabel={hintView.ariaLabel}
          text={hintView.text}
          tone={hintView.tone}
        />
      ))}
      <StudentRunnerSubmitControlsHandoff view={submitControlsHandoffView} />
    </section>
  );
}

function StudentRunnerSubmitReadiness({
  descriptionId,
  view,
}: {
  descriptionId: string;
  view: StudentRunnerSubmitReadinessView;
}) {
  const titleId = 'student-runner-submit-readiness-title';
  const statusLabelId = 'student-runner-submit-readiness-status-label';
  const statusValueId = 'student-runner-submit-readiness-status-value';

  return (
    <section
      aria-describedby={`${descriptionId} ${statusValueId}`}
      aria-label={view.ariaLabel}
      aria-labelledby={titleId}
      data-status={view.status}
      className="mb-4 rounded-md border bg-background p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id={titleId} className="text-sm font-medium">
            {view.title}
          </h3>
          <p id={descriptionId} className="mt-1 text-xs text-muted-foreground">
            {view.description}
          </p>
        </div>
        <span
          className={getStudentRunnerSubmitReadinessStatusClasses(view.status)}
        >
          <span id={statusLabelId} className="sr-only">
            {view.title}
          </span>
          <output
            aria-describedby={descriptionId}
            aria-label={view.ariaLabel}
            aria-labelledby={`${statusLabelId} ${statusValueId}`}
            id={statusValueId}
          >
            {view.statusLabel}
          </output>
        </span>
      </div>
      <ul className="mt-3 grid gap-2">
        {view.items.map((item) => (
          <StudentRunnerSubmitReadinessItem item={item} key={item.id} />
        ))}
      </ul>
    </section>
  );
}

function StudentRunnerSubmitReadinessItem({
  item,
}: {
  item: StudentRunnerSubmitReadinessItemView;
}) {
  const labelId = `student-runner-submit-readiness-${item.id}-label`;
  const valueId = `student-runner-submit-readiness-${item.id}-value`;
  const descriptionId = `student-runner-submit-readiness-${item.id}-description`;

  return (
    <li
      aria-label={item.ariaLabel}
      data-status={item.status}
      className={getStudentRunnerSubmitReadinessItemClasses(item.status)}
    >
      <StudentRunnerSubmitReadinessIcon status={item.status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p id={labelId} className="text-sm font-medium">
            {item.label}
          </p>
          <span
            className={getStudentRunnerSubmitReadinessStatusClasses(
              item.status
            )}
          >
            <output
              aria-describedby={descriptionId}
              aria-label={item.ariaLabel}
              aria-labelledby={`${labelId} ${valueId}`}
              id={valueId}
            >
              {item.statusLabel}
            </output>
          </span>
        </div>
        <p id={descriptionId} className="mt-1 text-xs text-muted-foreground">
          {item.description}
        </p>
      </div>
    </li>
  );
}

function StudentRunnerSubmitReadinessIcon({
  status,
}: {
  status: StudentRunnerSubmitReadinessItemView['status'];
}) {
  if (status === 'blocked') {
    return <IconAlertTriangle aria-hidden="true" className="mt-0.5 size-4" />;
  }

  if (status === 'needs-action') {
    return <IconInfoCircle aria-hidden="true" className="mt-0.5 size-4" />;
  }

  return <IconCircleCheck aria-hidden="true" className="mt-0.5 size-4" />;
}

function getStudentRunnerSubmitReadinessItemClasses(
  status: StudentRunnerSubmitReadinessItemView['status']
) {
  const base =
    'flex gap-3 rounded-md border p-3 text-sm transition-colors ' +
    '[&_svg]:shrink-0';

  if (status === 'blocked') {
    return `${base} border-destructive/30 bg-destructive/5 text-destructive`;
  }

  if (status === 'needs-action') {
    return `${base} border-amber-400/40 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200`;
  }

  return `${base} border-emerald-400/30 bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200`;
}

function getStudentRunnerSubmitReadinessStatusClasses(
  status: StudentRunnerSubmitReadinessItemView['status']
) {
  const base =
    'inline-flex w-fit items-center rounded-md border px-2 py-1 ' +
    'text-[0.6875rem] font-medium';

  if (status === 'blocked') {
    return `${base} border-destructive/30 bg-destructive/10 text-destructive`;
  }

  if (status === 'needs-action') {
    return `${base} border-amber-400/40 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-200`;
  }

  return `${base} border-emerald-400/30 bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-200`;
}

function StudentRunnerSubmitHint({
  ariaLabel,
  id,
  text,
  tone,
}: {
  ariaLabel: string;
  id: string;
  text: string;
  tone: 'info' | 'warning';
}) {
  return (
    <p
      aria-label={ariaLabel}
      data-tone={tone}
      id={id}
      role="note"
      className="mt-2 text-xs text-muted-foreground"
    >
      {text}
    </p>
  );
}

function StudentRunnerSubmitControlsHandoff({
  view,
}: {
  view: StudentRunnerSubmitControlsHandoffView;
}) {
  const titleId = 'student-runner-submit-controls-handoff-title';
  const descriptionId = 'student-runner-submit-controls-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="student-runner-submit-controls"
      data-handoff-scope={view.privacy.scope}
    >
      <h3 id={titleId}>{view.title}</h3>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <StudentRunnerSubmitControlsHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function StudentRunnerSubmitControlsHandoffItem({
  itemView,
}: {
  itemView: StudentRunnerSubmitControlsHandoffItemView;
}) {
  const labelId = `student-runner-submit-controls-handoff-${itemView.id}-label`;
  const valueId = `student-runner-submit-controls-handoff-${itemView.id}-value`;
  const descriptionId = `student-runner-submit-controls-handoff-${itemView.id}-description`;

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

function buildStudentRunnerSubmitHintId(id: string) {
  return `student-runner-submit-${id}-hint`;
}

function buildStudentRunnerPayloadMetricLabelId(key: string) {
  return `student-runner-submit-payload-${key}-label`;
}

function buildStudentRunnerPayloadMetricValueId(key: string) {
  return `student-runner-submit-payload-${key}-value`;
}

function buildStudentRunnerPayloadMetricDescriptionId(key: string) {
  return `student-runner-submit-payload-${key}-description`;
}
