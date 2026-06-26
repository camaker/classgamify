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
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">
            {assignmentResultSectionCopy.classReviewFocus.title}
          </h3>
          <div className="mt-3 grid gap-3">
            {brief.focusItemViews.length > 0 ? (
              brief.focusItemViews.map((itemView) => (
                <div key={itemView.itemId} className="grid gap-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 font-medium">
                      {itemView.itemNumberLabel} {itemView.prompt}
                    </p>
                    <Badge variant="outline" className="rounded-md">
                      {itemView.correctRateLabel}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {itemView.correctSummaryLabel}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {assignmentResultSectionCopy.classReviewFocus.emptyMessage}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/20 p-4">
          <h3 className="font-medium text-sm">
            {assignmentResultSectionCopy.studentFollowUp.title}
          </h3>
          <div className="mt-3 grid gap-3">
            {brief.followUpStudentViews.length > 0 ? (
              brief.followUpStudentViews.map((studentView) => (
                <div
                  key={studentView.studentKey}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {studentView.studentLabel}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {studentView.accuracyLabel}
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-md">
                    {studentView.needsReviewLabel}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {assignmentResultSectionCopy.studentFollowUp.emptyMessage}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
