import type { AssignmentClassroomBriefFollowUpStudentView } from '@/assignments/classroom-brief';
import type { AssignmentResultSectionView } from '@/assignments/result-view';
import { Badge } from '@/components/ui/badge';

export function AssignmentResultsFollowUpPanel({
  followUpStudentViews,
  sectionView,
}: {
  followUpStudentViews: AssignmentClassroomBriefFollowUpStudentView[];
  sectionView: AssignmentResultSectionView;
}) {
  const titleId = 'assignment-results-follow-up-title';

  return (
    <section aria-labelledby={titleId} className="grid content-start gap-3">
      <h2 id={titleId} className="font-semibold text-lg">
        {sectionView.title}
      </h2>
      {followUpStudentViews.length > 0 ? (
        <ul className="grid divide-y rounded-lg border bg-card">
          {followUpStudentViews.map((studentView) => (
            <li key={studentView.studentKey} className="px-4 py-3">
              <AssignmentResultsFollowUpStudent studentView={studentView} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
          {sectionView.emptyMessage}
        </p>
      )}
    </section>
  );
}

function AssignmentResultsFollowUpStudent({
  studentView,
}: {
  studentView: AssignmentClassroomBriefFollowUpStudentView;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid min-w-0 gap-0.5">
        <p className="truncate font-semibold">{studentView.studentLabel}</p>
        <p className="text-muted-foreground text-sm">
          {studentView.accuracyLabel}
          {studentView.submittedContextLabel
            ? ` · ${studentView.submittedContextLabel}`
            : ''}
        </p>
        <p className="text-sm">{studentView.followUpRecommendation}</p>
      </div>
      <Badge
        variant="outline"
        className="shrink-0 rounded-md border-warning/50 bg-warning/10 text-warning-text"
      >
        {studentView.needsReviewLabel}
      </Badge>
    </div>
  );
}
