import type {
  AssignmentClassroomBrief,
  AssignmentClassroomBriefCopyPreview,
  AssignmentClassroomBriefFocusItemView,
  AssignmentClassroomBriefFollowUpStudentView,
  AssignmentClassroomBriefScopeView,
  AssignmentClassroomBriefStatView,
} from '@/assignments/classroom-brief';
import type {
  AssignmentResultActionButton,
  AssignmentResultClassroomBriefSectionViews,
  AssignmentResultCopyArtifactPreview,
  AssignmentResultCopyArtifactPreviewScope,
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
          copyArtifactPreviews={copyArtifactPreviews}
          copyPreview={brief.copyPreview}
          copyScopeView={copyScopeView}
          onResultAction={onResultAction}
        />
      </CardContent>
    </Card>
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
  const descriptionId = `assignment-results-classroom-brief-scope-${scopeView.id}-description`;

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <dt className="text-muted-foreground text-xs">{scopeView.label}</dt>
      <dd aria-describedby={descriptionId}>
        <output aria-label={scopeView.ariaLabel} className="mt-1 block">
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
  const descriptionId = `assignment-results-classroom-brief-stat-${statView.key}-description`;

  return (
    <div className="rounded-md border bg-background p-3">
      <dt className="text-muted-foreground text-xs">{statView.label}</dt>
      <dd aria-describedby={descriptionId}>
        <output aria-label={statView.ariaLabel} className="mt-1 block">
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
      <div className="grid gap-2 md:grid-cols-3">
        {copyScopeView.itemViews.map((itemView) => (
          <div className="grid gap-1 text-xs" key={itemView.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md bg-background">
                {itemView.label}
              </Badge>
              <span className="font-medium">{itemView.value}</span>
            </div>
            <p className="text-muted-foreground">{itemView.description}</p>
          </div>
        ))}
      </div>
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

function AssignmentResultsCopyScopeSummaryItem({
  summaryItem,
}: {
  summaryItem: AssignmentResultCopyScopeSummaryItemView;
}) {
  const descriptionId = `assignment-results-copy-scope-summary-${summaryItem.id}-description`;

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 text-xs">
      <dt className="text-muted-foreground">{summaryItem.label}</dt>
      <dd aria-describedby={descriptionId} className="font-medium">
        <output aria-label={summaryItem.ariaLabel}>{summaryItem.value}</output>
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

  return (
    <article className="grid gap-2 rounded-md border bg-background p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h4 className="font-medium text-sm">{preview.label}</h4>
          <p className="text-muted-foreground text-xs">{preview.description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 bg-background"
          disabled={preview.actionButton.disabled}
          onClick={() => onResultAction(preview.actionButton)}
          aria-describedby={disabledReasonId}
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
}: {
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
}) {
  return (
    <section
      aria-label={copyScopeView.title}
      className="grid gap-2 rounded-md bg-muted/30 p-2 text-xs"
    >
      <p className="font-medium">{copyScopeView.title}</p>
      <div className="flex flex-wrap gap-2">
        {copyScopeView.itemViews.map((itemView) => (
          <Badge key={itemView.id} variant="outline" className="rounded-md">
            <span>{itemView.label}</span>
            <span className="ml-1 font-medium">{itemView.value}</span>
          </Badge>
        ))}
      </div>
      {copyScopeView.summaryItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {copyScopeView.summaryItems.map((summaryItem) => (
            <Badge
              aria-label={summaryItem.ariaLabel}
              key={summaryItem.id}
              variant="secondary"
              className="rounded-md"
            >
              <span>{summaryItem.label}</span>
              <span className="ml-1 font-medium">{summaryItem.value}</span>
              <span className="sr-only">{summaryItem.description}</span>
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
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
