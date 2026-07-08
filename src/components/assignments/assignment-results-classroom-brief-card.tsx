import type {
  AssignmentClassroomBrief,
  AssignmentClassroomBriefCopyPreview,
  AssignmentClassroomBriefFocusItemView,
  AssignmentClassroomBriefFollowUpStudentView,
  AssignmentClassroomBriefScopeView,
  AssignmentClassroomBriefStatView,
} from '@/assignments/classroom-brief';
import type {
  AssignmentStudentFollowUpPriorityHandoffItemView,
  AssignmentStudentFollowUpPriorityHandoffView,
} from '@/assignments/student-follow-up-priority';
import type {
  AssignmentCopyArtifactHandoffItemView,
  AssignmentCopyArtifactHandoffView,
} from '@/assignments/copy-artifact-handoff';
import type {
  AssignmentResultActionButton,
  AssignmentResultClassroomBriefSectionViews,
  AssignmentResultCopyArtifactPreview,
  AssignmentResultCopyArtifactPreviewScope,
  AssignmentResultCopyScopeItemView,
  AssignmentResultCopyScopeView,
  AssignmentResultCopyScopeSummaryItemView,
  AssignmentResultSectionView,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconClipboardText, IconCopy } from '@tabler/icons-react';

type AssignmentResultsClassroomBriefCardProps = {
  brief: AssignmentClassroomBrief;
  copyArtifactHandoffView: AssignmentCopyArtifactHandoffView | null;
  copyArtifactPreviews: Array<
    AssignmentResultCopyArtifactPreview & {
      actionButton: AssignmentResultActionButton;
    }
  >;
  copyScopeView: AssignmentResultCopyScopeView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  sectionViews: AssignmentResultClassroomBriefSectionViews;
};

export function AssignmentResultsClassroomBriefCard({
  brief,
  copyArtifactHandoffView,
  copyArtifactPreviews,
  copyScopeView,
  onResultAction,
  sectionViews,
}: AssignmentResultsClassroomBriefCardProps) {
  const titleId = 'assignment-results-classroom-brief-title';
  const descriptionId = sectionViews.classroomBrief.description
    ? 'assignment-results-classroom-brief-description'
    : undefined;

  return (
    <Card
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="rounded-lg"
      role="article"
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconClipboardText
            aria-hidden="true"
            className="size-5 text-primary"
          />
          <CardTitle>
            <h2 id={titleId} className="text-lg font-semibold">
              {sectionViews.classroomBrief.title}
            </h2>
          </CardTitle>
        </div>
        {sectionViews.classroomBrief.description ? (
          <CardDescription>
            <p id={descriptionId}>{sectionViews.classroomBrief.description}</p>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        <AssignmentResultsClassroomBriefScope brief={brief} />
        <AssignmentResultsClassroomBriefStats brief={brief} />
        <AssignmentStudentFollowUpPriorityHandoff
          handoffView={brief.followUpPriorityHandoffView}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <AssignmentResultsClassFocusPanel
            focusItemViews={brief.focusItemViews}
            sectionView={sectionViews.classReviewFocus}
          />
          <AssignmentResultsFollowUpPanel
            followUpStudentViews={brief.followUpStudentViews}
            sectionView={sectionViews.studentFollowUp}
          />
        </div>
        <AssignmentResultsClassroomBriefCopyPreview
          copyArtifactHandoffView={copyArtifactHandoffView}
          copyArtifactPreviews={copyArtifactPreviews}
          copyPreview={brief.copyPreview}
          copyScopeView={copyScopeView}
          onResultAction={onResultAction}
        />
      </CardContent>
    </Card>
  );
}

function AssignmentStudentFollowUpPriorityHandoff({
  handoffView,
}: {
  handoffView: AssignmentStudentFollowUpPriorityHandoffView;
}) {
  const titleId = 'assignment-student-follow-up-priority-handoff-title';
  const descriptionId =
    'assignment-student-follow-up-priority-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-student-follow-up-priority"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <h3 id={titleId}>{handoffView.title}</h3>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((itemView) => (
          <AssignmentStudentFollowUpPriorityHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentStudentFollowUpPriorityHandoffItem({
  itemView,
}: {
  itemView: AssignmentStudentFollowUpPriorityHandoffItemView;
}) {
  const labelId = `assignment-student-follow-up-priority-handoff-${itemView.id}-label`;
  const valueId = `assignment-student-follow-up-priority-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-student-follow-up-priority-handoff-${itemView.id}-description`;

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
        <p id={descriptionId}>{itemView.description}</p>
      </dd>
    </div>
  );
}

function AssignmentResultsClassroomBriefScope({
  brief,
}: {
  brief: AssignmentClassroomBrief;
}) {
  const labelId = 'assignment-results-classroom-brief-scope-label';

  return (
    <section
      aria-labelledby={labelId}
      className="grid gap-3 rounded-lg border bg-background p-4"
    >
      <h3 id={labelId} className="font-medium text-sm">
        {brief.scopeLabel}
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {brief.scopeViews.map((scopeView) => (
          <AssignmentResultsClassroomBriefScopeItem
            key={scopeView.id}
            scopeView={scopeView}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultsClassroomBriefScopeItem({
  scopeView,
}: {
  scopeView: AssignmentClassroomBriefScopeView;
}) {
  const labelId = `assignment-results-classroom-brief-scope-${scopeView.id}-label`;
  const valueId = `assignment-results-classroom-brief-scope-${scopeView.id}-value`;
  const descriptionId = `assignment-results-classroom-brief-scope-${scopeView.id}-description`;

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <dt id={labelId} className="text-muted-foreground text-xs">
        {scopeView.label}
      </dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={scopeView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          className="mt-1 block"
          id={valueId}
        >
          <span className="font-semibold text-lg">{scopeView.value}</span>
        </output>
      </dd>
      <dd id={descriptionId} className="mt-1 text-muted-foreground text-xs">
        {scopeView.description}
      </dd>
    </div>
  );
}

function AssignmentResultsClassroomBriefStats({
  brief,
}: {
  brief: AssignmentClassroomBrief;
}) {
  const labelId = 'assignment-results-classroom-brief-stats-label';

  return (
    <section
      aria-labelledby={labelId}
      className="grid gap-3 rounded-lg border bg-muted/20 p-4"
    >
      <h3 id={labelId} className="font-medium text-sm">
        {brief.statSummaryLabel}
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {brief.statViews.map((statView) => (
          <AssignmentResultsClassroomBriefStat
            key={statView.key}
            statView={statView}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentResultsClassroomBriefStat({
  statView,
}: {
  statView: AssignmentClassroomBriefStatView;
}) {
  const labelId = `assignment-results-classroom-brief-stat-${statView.key}-label`;
  const valueId = `assignment-results-classroom-brief-stat-${statView.key}-value`;
  const descriptionId = `assignment-results-classroom-brief-stat-${statView.key}-description`;

  return (
    <div className="rounded-md border bg-background p-3">
      <dt id={labelId} className="text-muted-foreground text-xs">
        {statView.label}
      </dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-label={statView.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          className="mt-1 block"
          id={valueId}
        >
          <span className="font-semibold text-lg">{statView.value}</span>
        </output>
      </dd>
      <dd id={descriptionId} className="sr-only">
        {statView.description}
      </dd>
    </div>
  );
}

function AssignmentResultsClassFocusPanel({
  focusItemViews,
  sectionView,
}: {
  focusItemViews: AssignmentClassroomBriefFocusItemView[];
  sectionView: AssignmentResultSectionView;
}) {
  const titleId = 'assignment-results-class-focus-title';

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-lg border bg-muted/20 p-4"
    >
      <h3 id={titleId} className="font-medium text-sm">
        {sectionView.title}
      </h3>
      <div className="mt-3 grid gap-3">
        {focusItemViews.length > 0 ? (
          focusItemViews.map((itemView) => (
            <AssignmentResultsClassFocusItem
              itemView={itemView}
              key={itemView.itemId}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            {sectionView.emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

function AssignmentResultsFollowUpPanel({
  followUpStudentViews,
  sectionView,
}: {
  followUpStudentViews: AssignmentClassroomBriefFollowUpStudentView[];
  sectionView: AssignmentResultSectionView;
}) {
  const titleId = 'assignment-results-follow-up-title';

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-lg border bg-muted/20 p-4"
    >
      <h3 id={titleId} className="font-medium text-sm">
        {sectionView.title}
      </h3>
      <div className="mt-3 grid gap-3">
        {followUpStudentViews.length > 0 ? (
          followUpStudentViews.map((studentView) => (
            <AssignmentResultsFollowUpStudent
              key={studentView.studentKey}
              studentView={studentView}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            {sectionView.emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

function AssignmentResultsClassFocusItem({
  itemView,
}: {
  itemView: AssignmentClassroomBriefFocusItemView;
}) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 font-medium">{itemView.promptLabel}</p>
        <Badge variant="outline" className="rounded-md">
          {itemView.correctRateLabel}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-md">
          {itemView.kindLabel}
        </Badge>
        <p className="text-muted-foreground text-xs">
          {itemView.performanceLabel}
        </p>
      </div>
      <p className="text-muted-foreground text-xs">
        {itemView.correctSummaryLabel}
      </p>
    </div>
  );
}

function AssignmentResultsFollowUpStudent({
  studentView,
}: {
  studentView: AssignmentClassroomBriefFollowUpStudentView;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{studentView.studentLabel}</p>
        <p className="text-muted-foreground text-xs">
          {studentView.accuracyLabel}
        </p>
        {studentView.submittedContextLabel ? (
          <p className="text-muted-foreground text-xs">
            {studentView.submittedContextLabel}
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          {studentView.followUpRecommendation}
        </p>
      </div>
      <Badge variant="secondary" className="rounded-md">
        {studentView.needsReviewLabel}
      </Badge>
    </div>
  );
}

function AssignmentResultsClassroomBriefCopyPreview({
  copyArtifactHandoffView,
  copyArtifactPreviews,
  copyPreview,
  copyScopeView,
  onResultAction,
}: {
  copyArtifactPreviews: Array<
    AssignmentResultCopyArtifactPreview & {
      actionButton: AssignmentResultActionButton;
    }
  >;
  copyArtifactHandoffView: AssignmentCopyArtifactHandoffView | null;
  copyPreview: AssignmentClassroomBriefCopyPreview;
  copyScopeView: AssignmentResultCopyScopeView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
}) {
  const labelId = 'assignment-results-classroom-brief-copy-preview-label';

  return (
    <section
      aria-labelledby={labelId}
      className="grid gap-2 rounded-lg border bg-muted/20 p-4"
    >
      <h3 id={labelId} className="font-medium text-sm">
        {copyPreview.label}
      </h3>
      <AssignmentCopyArtifactHandoff handoffView={copyArtifactHandoffView} />
      <AssignmentResultsCopyScopeView copyScopeView={copyScopeView} />
      <div className="grid gap-3 lg:grid-cols-2">
        {copyArtifactPreviews.map((preview) => (
          <AssignmentResultsCopyArtifactPreview
            key={preview.id}
            onResultAction={onResultAction}
            preview={preview}
          />
        ))}
      </div>
    </section>
  );
}

function AssignmentCopyArtifactHandoff({
  handoffView,
}: {
  handoffView: AssignmentCopyArtifactHandoffView | null;
}) {
  if (!handoffView) return null;

  const titleId = 'assignment-copy-artifact-handoff-title';
  const descriptionId = 'assignment-copy-artifact-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="assignment-copy-artifact"
      data-handoff-scope={handoffView.privacy.scope}
    >
      <h4 id={titleId}>{handoffView.title}</h4>
      <p id={descriptionId}>{handoffView.description}</p>
      <dl>
        {handoffView.itemViews.map((itemView) => (
          <AssignmentCopyArtifactHandoffItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
    </section>
  );
}

function AssignmentCopyArtifactHandoffItem({
  itemView,
}: {
  itemView: AssignmentCopyArtifactHandoffItemView;
}) {
  const labelId = `assignment-copy-artifact-handoff-${itemView.id}-label`;
  const valueId = `assignment-copy-artifact-handoff-${itemView.id}-value`;
  const descriptionId = `assignment-copy-artifact-handoff-${itemView.id}-description`;

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
      </dd>
      <dd id={descriptionId}>{itemView.description}</dd>
    </div>
  );
}

function AssignmentResultsCopyScopeView({
  copyScopeView,
}: {
  copyScopeView: AssignmentResultCopyScopeView;
}) {
  const titleId = 'assignment-results-copy-scope-title';
  const descriptionId = 'assignment-results-copy-scope-description';
  const summaryLabelId = 'assignment-results-copy-scope-summary-label';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-3 rounded-md border bg-background p-3"
    >
      <div className="grid gap-1">
        <h4 id={titleId} className="font-medium text-sm">
          {copyScopeView.title}
        </h4>
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {copyScopeView.description}
        </p>
      </div>
      <dl className="grid gap-2 md:grid-cols-3">
        {copyScopeView.itemViews.map((itemView) => (
          <AssignmentResultsCopyScopeItem
            itemView={itemView}
            key={itemView.id}
          />
        ))}
      </dl>
      {copyScopeView.summaryItems.length > 0 ? (
        <section aria-labelledby={summaryLabelId} className="grid gap-2">
          <p id={summaryLabelId} className="font-medium text-xs">
            {copyScopeView.summaryLabel}
          </p>
          <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {copyScopeView.summaryItems.map((summaryItem) => (
              <AssignmentResultsCopyScopeSummaryItem
                key={summaryItem.id}
                summaryItem={summaryItem}
              />
            ))}
          </dl>
        </section>
      ) : null}
    </section>
  );
}

function AssignmentResultsCopyScopeItem({
  itemView,
}: {
  itemView: AssignmentResultCopyScopeItemView;
}) {
  const labelId = `assignment-results-copy-scope-${itemView.id}-label`;
  const valueId = `assignment-results-copy-scope-${itemView.id}-value`;
  const descriptionId = `assignment-results-copy-scope-${itemView.id}-description`;

  return (
    <div className="grid gap-1 text-xs">
      <dt>
        <Badge
          id={labelId}
          variant="outline"
          className="rounded-md bg-background"
        >
          {itemView.label}
        </Badge>
      </dt>
      <dd>
        <output
          aria-describedby={descriptionId}
          aria-labelledby={`${labelId} ${valueId}`}
          className="font-medium"
          id={valueId}
        >
          {itemView.value}
        </output>
      </dd>
      <dd id={descriptionId} className="text-muted-foreground">
        {itemView.description}
      </dd>
    </div>
  );
}

function AssignmentResultsCopyScopeSummaryItem({
  summaryItem,
}: {
  summaryItem: AssignmentResultCopyScopeSummaryItemView;
}) {
  const labelId = `assignment-results-copy-scope-summary-${summaryItem.id}-label`;
  const valueId = `assignment-results-copy-scope-summary-${summaryItem.id}-value`;
  const descriptionId = `assignment-results-copy-scope-summary-${summaryItem.id}-description`;

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 text-xs">
      <dt id={labelId} className="text-muted-foreground">
        {summaryItem.label}
      </dt>
      <dd aria-describedby={descriptionId} className="font-medium">
        <output
          aria-describedby={descriptionId}
          aria-label={summaryItem.ariaLabel}
          aria-labelledby={`${labelId} ${valueId}`}
          id={valueId}
        >
          {summaryItem.value}
        </output>
        <span id={descriptionId} className="sr-only">
          {summaryItem.description}
        </span>
      </dd>
    </div>
  );
}

function AssignmentResultsCopyArtifactPreview({
  onResultAction,
  preview,
}: {
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  preview: AssignmentResultCopyArtifactPreview & {
    actionButton: AssignmentResultActionButton;
  };
}) {
  const disabledReasonId = getCopyArtifactPreviewDisabledReasonId(
    preview.actionButton
  );
  const titleId = getCopyArtifactPreviewTitleId(preview.id);
  const descriptionId = getCopyArtifactPreviewDescriptionId(preview.id);
  const scopeTitleId = getCopyArtifactPreviewScopeTitleId(preview.id);
  const scopeDescriptionId = getCopyArtifactPreviewScopeDescriptionId(
    preview.id
  );
  const describedBy = [descriptionId, scopeDescriptionId, disabledReasonId]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-2 rounded-md border bg-background p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h4 id={titleId} className="font-medium text-sm">
            {preview.label}
          </h4>
          <p id={descriptionId} className="text-muted-foreground text-xs">
            {preview.description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 bg-background"
          disabled={preview.actionButton.disabled}
          onClick={() => onResultAction(preview.actionButton)}
          aria-label={preview.actionButton.ariaLabel}
          aria-describedby={describedBy}
        >
          <IconCopy aria-hidden="true" className="size-4" />
          {preview.actionButton.label}
        </Button>
      </div>
      <AssignmentResultsCopyArtifactDisabledReason
        actionButton={preview.actionButton}
        disabledReasonId={disabledReasonId}
      />
      <AssignmentResultsCopyArtifactPreviewScope
        copyScopeView={preview.copyScopeView}
        descriptionId={scopeDescriptionId}
        previewId={preview.id}
        titleId={scopeTitleId}
      />
      <div className="grid gap-2">
        <p className="font-medium text-xs">{preview.summaryLabel}</p>
        <div className="flex flex-wrap gap-2">
          {preview.metaItems.map((metaItem) => (
            <Badge
              key={metaItem.key}
              variant="secondary"
              className="rounded-md"
            >
              {metaItem.label}: {metaItem.value}
            </Badge>
          ))}
        </div>
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-muted-foreground text-xs">
        {preview.text}
      </pre>
    </article>
  );
}

function AssignmentResultsCopyArtifactPreviewScope({
  copyScopeView,
  descriptionId,
  previewId,
  titleId,
}: {
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
  descriptionId: string;
  previewId: AssignmentResultCopyArtifactPreview['id'];
  titleId: string;
}) {
  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="grid gap-2 rounded-md bg-muted/30 p-2 text-xs"
    >
      <p id={titleId} className="font-medium">
        {copyScopeView.title}
      </p>
      <p id={descriptionId} className="sr-only">
        {copyScopeView.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {copyScopeView.itemViews.map((itemView) => (
          <AssignmentResultsCopyArtifactPreviewScopeItem
            itemView={itemView}
            key={itemView.id}
            previewId={previewId}
          />
        ))}
      </div>
      {copyScopeView.summaryItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {copyScopeView.summaryItems.map((summaryItem) => (
            <AssignmentResultsCopyArtifactPreviewScopeSummaryItem
              key={summaryItem.id}
              previewId={previewId}
              summaryItem={summaryItem}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AssignmentResultsCopyArtifactPreviewScopeItem({
  itemView,
  previewId,
}: {
  itemView: AssignmentResultCopyScopeItemView;
  previewId: AssignmentResultCopyArtifactPreview['id'];
}) {
  const labelId = `assignment-result-copy-preview-${previewId}-scope-${itemView.id}-label`;
  const valueId = `assignment-result-copy-preview-${previewId}-scope-${itemView.id}-value`;
  const descriptionId = `assignment-result-copy-preview-${previewId}-scope-${itemView.id}-description`;

  return (
    <Badge
      aria-describedby={descriptionId}
      aria-labelledby={`${labelId} ${valueId}`}
      variant="outline"
      className="rounded-md"
    >
      <span id={labelId}>{itemView.label}</span>
      <output
        aria-describedby={descriptionId}
        aria-labelledby={`${labelId} ${valueId}`}
        className="ml-1 font-medium"
        id={valueId}
      >
        {itemView.value}
      </output>
      <span id={descriptionId} className="sr-only">
        {itemView.description}
      </span>
    </Badge>
  );
}

function AssignmentResultsCopyArtifactPreviewScopeSummaryItem({
  previewId,
  summaryItem,
}: {
  previewId: AssignmentResultCopyArtifactPreview['id'];
  summaryItem: AssignmentResultCopyScopeSummaryItemView;
}) {
  const labelId = `assignment-result-copy-preview-${previewId}-scope-summary-${summaryItem.id}-label`;
  const valueId = `assignment-result-copy-preview-${previewId}-scope-summary-${summaryItem.id}-value`;
  const descriptionId = `assignment-result-copy-preview-${previewId}-scope-summary-${summaryItem.id}-description`;

  return (
    <Badge
      aria-describedby={descriptionId}
      aria-label={summaryItem.ariaLabel}
      aria-labelledby={`${labelId} ${valueId}`}
      variant="secondary"
      className="rounded-md"
    >
      <span id={labelId}>{summaryItem.label}</span>
      <output
        aria-describedby={descriptionId}
        aria-label={summaryItem.ariaLabel}
        aria-labelledby={`${labelId} ${valueId}`}
        className="ml-1 font-medium"
        id={valueId}
      >
        {summaryItem.value}
      </output>
      <span id={descriptionId} className="sr-only">
        {summaryItem.description}
      </span>
    </Badge>
  );
}

function AssignmentResultsCopyArtifactDisabledReason({
  actionButton,
  disabledReasonId,
}: {
  actionButton: AssignmentResultActionButton;
  disabledReasonId: string | undefined;
}) {
  if (!actionButton.disabledReason) return null;

  return (
    <p id={disabledReasonId} className="text-muted-foreground text-xs">
      {actionButton.disabledReason}
    </p>
  );
}

function getCopyArtifactPreviewDisabledReasonId({
  disabledReason,
  id,
}: Pick<AssignmentResultActionButton, 'disabledReason' | 'id'>) {
  return disabledReason
    ? `assignment-result-copy-preview-${id}-disabled-reason`
    : undefined;
}

function getCopyArtifactPreviewTitleId(
  id: AssignmentResultCopyArtifactPreview['id']
) {
  return `assignment-result-copy-preview-${id}-title`;
}

function getCopyArtifactPreviewDescriptionId(
  id: AssignmentResultCopyArtifactPreview['id']
) {
  return `assignment-result-copy-preview-${id}-description`;
}

function getCopyArtifactPreviewScopeTitleId(
  id: AssignmentResultCopyArtifactPreview['id']
) {
  return `assignment-result-copy-preview-${id}-scope-title`;
}

function getCopyArtifactPreviewScopeDescriptionId(
  id: AssignmentResultCopyArtifactPreview['id']
) {
  return `assignment-result-copy-preview-${id}-scope-description`;
}
