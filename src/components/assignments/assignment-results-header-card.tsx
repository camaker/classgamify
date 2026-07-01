import type {
  AssignmentResultActionButton,
  AssignmentResultHeaderView,
} from '@/assignments/result-view';
import { AssignmentResultsHeaderActions } from '@/components/assignments/assignment-results-header-actions';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AssignmentResultsHeaderCardProps = {
  headerView: AssignmentResultHeaderView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  resultActions: AssignmentResultActionButton[];
};

export function AssignmentResultsHeaderCard({
  headerView,
  onResultAction,
  resultActions,
}: AssignmentResultsHeaderCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {headerView.statusLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {headerView.templateLabel}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{headerView.activityTitle}</h2>
        </CardTitle>
        <CardDescription>
          <p>{headerView.activityDescription}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <AssignmentSettingsSummary view={headerView.settingsSummaryView} />
        <AssignmentResultsHeaderActions
          exportPreparationView={headerView.exportPreparationView}
          onResultAction={onResultAction}
          printAction={headerView.printAction}
          resultActionsLabel={headerView.resultActionsLabel}
          resultActions={resultActions}
          shareAction={headerView.shareAction}
        />
      </CardContent>
    </Card>
  );
}
