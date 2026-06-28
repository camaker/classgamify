import {
  assignmentResultSectionCopy,
  type buildAssignmentResultsPageViewModel,
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

type AssignmentResultsClassroomBrief = NonNullable<
  ReturnType<typeof buildAssignmentResultsPageViewModel>['classroomBrief']
>;

type AssignmentResultsClassroomBriefCardProps = {
  brief: AssignmentResultsClassroomBrief;
};

export function AssignmentResultsClassroomBriefCard({
  brief,
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
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <AssignmentResultsClassFocusPanel
          focusItemViews={brief.focusItemViews}
        />
        <AssignmentResultsFollowUpPanel
          followUpStudentViews={brief.followUpStudentViews}
        />
      </CardContent>
    </Card>
  );
}

function AssignmentResultsClassFocusPanel({
  focusItemViews,
}: {
  focusItemViews: AssignmentResultsClassroomBrief['focusItemViews'];
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
  followUpStudentViews: AssignmentResultsClassroomBrief['followUpStudentViews'];
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
  itemView: AssignmentResultsClassroomBrief['focusItemViews'][number];
}) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 font-medium">{itemView.promptLabel}</p>
        <Badge variant="outline" className="rounded-md">
          {itemView.correctRateLabel}
        </Badge>
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
  studentView: AssignmentResultsClassroomBrief['followUpStudentViews'][number];
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
