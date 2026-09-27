import type { AssignmentResultHeaderView } from '@/assignments/result-view';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { Badge } from '@/components/ui/badge';
import { m } from '@/locale/paraglide/messages';
import { IconChevronDown } from '@tabler/icons-react';

type AssignmentResultsHeaderCardProps = {
  headerView: AssignmentResultHeaderView;
};

/**
 * Delivery settings for this assignment, collapsed by default: teachers
 * set them when publishing and rarely need them while reviewing results.
 */
export function AssignmentResultsHeaderCard({
  headerView,
}: AssignmentResultsHeaderCardProps) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="font-medium text-sm">
          {m.assignment_results_settings_toggle()}
        </span>
        <Badge variant="secondary" className="rounded-md">
          {headerView.statusLabel}
        </Badge>
        <Badge variant="outline" className="rounded-md">
          {headerView.templateLabel}
        </Badge>
        <IconChevronDown
          aria-hidden="true"
          className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="grid gap-3 border-t px-4 py-4">
        <div>
          <h2 className="font-semibold text-base">
            {headerView.activityTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {headerView.activityDescription}
          </p>
        </div>
        <AssignmentSettingsSummary view={headerView.settingsSummaryView} />
      </div>
    </details>
  );
}
