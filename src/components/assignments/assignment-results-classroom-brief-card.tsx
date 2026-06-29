import type { AssignmentClassroomBrief } from '@/assignments/classroom-brief';
import {
  assignmentResultSectionCopy,
  type AssignmentResultActionButton,
  type AssignmentResultCopyArtifactPreview,
  type AssignmentResultCopyScopeView,
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
};

export function AssignmentResultsClassroomBriefCard({
  brief,
  copyArtifactPreviews,
  copyScopeView,
  onResultAction,
}: AssignmentResultsClassroomBriefCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconClipboardText className="size-5 text-primary" />
          <CardTitle>
            <h2 className="text-lg font-semibold">
              {assignmentResultSectionCopy.classroomBrief.title}
            </h2>
          </CardTitle>
        </div>
        <CardDescription>
          <p>{assignmentResultSectionCopy.classroomBrief.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <AssignmentResultsClassroomBriefStats brief={brief} />
        <div className="grid gap-4 lg:grid-cols-2">
          <AssignmentResultsClassFocusPanel
            focusItemViews={brief.focusItemViews}
          />
          <AssignmentResultsFollowUpPanel
            followUpStudentViews={brief.followUpStudentViews}
          />
        </div>
        <AssignmentResultsClassroomBriefCopyPreview
          brief={brief}
          copyArtifactPreviews={copyArtifactPreviews}
          copyScopeView={copyScopeView}
          onResultAction={onResultAction}
        />
      </CardContent>
    </Card>
  );
}

function AssignmentResultsClassroomBriefStats({
  brief,
}: {
  brief: AssignmentClassroomBrief;
}) {
  return (
    <section className="grid gap-3 rounded-lg border bg-muted/20 p-4">
      <h3 className="font-medium text-sm">{brief.statSummaryLabel}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {brief.statViews.map((statView) => (
          <AssignmentResultsClassroomBriefStat
            key={statView.key}
            statView={statView}
          />
        ))}
      </div>
    </section>
  );
}

function AssignmentResultsClassroomBriefStat({
  statView,
}: {
  statView: AssignmentClassroomBrief['statViews'][number];
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-muted-foreground text-xs">{statView.label}</p>
      <p className="mt-1 font-semibold text-lg">{statView.value}</p>
    </div>
  );
}

function AssignmentResultsClassFocusPanel({
  focusItemViews,
}: {
  focusItemViews: AssignmentClassroomBrief['focusItemViews'];
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <h3 className="font-medium text-sm">
        {assignmentResultSectionCopy.classReviewFocus.title}
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
            {assignmentResultSectionCopy.classReviewFocus.emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function AssignmentResultsFollowUpPanel({
  followUpStudentViews,
}: {
  followUpStudentViews: AssignmentClassroomBrief['followUpStudentViews'];
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <h3 className="font-medium text-sm">
        {assignmentResultSectionCopy.studentFollowUp.title}
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
            {assignmentResultSectionCopy.studentFollowUp.emptyMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function AssignmentResultsClassFocusItem({
  itemView,
}: {
  itemView: AssignmentClassroomBrief['focusItemViews'][number];
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
  studentView: AssignmentClassroomBrief['followUpStudentViews'][number];
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{studentView.studentLabel}</p>
        <p className="text-muted-foreground text-xs">
          {studentView.accuracyLabel}
        </p>
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
  brief,
  copyArtifactPreviews,
  copyScopeView,
  onResultAction,
}: {
  brief: AssignmentClassroomBrief;
  copyArtifactPreviews: Array<
    AssignmentResultCopyArtifactPreview & {
      actionButton: AssignmentResultActionButton;
    }
  >;
  copyScopeView: AssignmentResultCopyScopeView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
}) {
  return (
    <section className="grid gap-2 rounded-lg border bg-muted/20 p-4">
      <h3 className="font-medium text-sm">{brief.copyPreview.label}</h3>
      <AssignmentResultsCopyScopeView copyScopeView={copyScopeView} />
      <div className="grid gap-3 lg:grid-cols-2">
        {copyArtifactPreviews.map((preview) => (
          <AssignmentResultsCopyArtifactPreview
            key={preview.action}
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
  return (
    <div className="grid gap-3 rounded-md border bg-background p-3">
      <div className="grid gap-1">
        <h4 className="font-medium text-sm">{copyScopeView.title}</h4>
        <p className="text-muted-foreground text-xs">
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
        >
          <IconCopy className="size-4" />
          {preview.actionButton.label}
        </Button>
      </div>
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
