import type { AssignmentClassroomBrief } from '@/assignments/classroom-brief';
import {
  assignmentResultSectionCopy,
  type AssignmentResultCopyArtifactPreview,
} from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconClipboardText } from '@tabler/icons-react';

type AssignmentResultsClassroomBriefCardProps = {
  brief: AssignmentClassroomBrief;
  copyArtifactPreviews: AssignmentResultCopyArtifactPreview[];
};

export function AssignmentResultsClassroomBriefCard({
  brief,
  copyArtifactPreviews,
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
}: {
  brief: AssignmentClassroomBrief;
  copyArtifactPreviews: AssignmentResultCopyArtifactPreview[];
}) {
  return (
    <section className="grid gap-2 rounded-lg border bg-muted/20 p-4">
      <h3 className="font-medium text-sm">{brief.copyPreview.label}</h3>
      <div className="grid gap-3 lg:grid-cols-2">
        {copyArtifactPreviews.map((preview) => (
          <AssignmentResultsCopyArtifactPreview
            key={preview.action}
            preview={preview}
          />
        ))}
      </div>
    </section>
  );
}

function AssignmentResultsCopyArtifactPreview({
  preview,
}: {
  preview: AssignmentResultCopyArtifactPreview;
}) {
  return (
    <article className="grid gap-2 rounded-md border bg-background p-3">
      <div className="grid gap-1">
        <h4 className="font-medium text-sm">{preview.label}</h4>
        <p className="text-muted-foreground text-xs">{preview.description}</p>
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-muted-foreground text-xs">
        {preview.text}
      </pre>
    </article>
  );
}
