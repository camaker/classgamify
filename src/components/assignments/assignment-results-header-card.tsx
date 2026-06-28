import type {
  AssignmentResultActionButton,
  buildAssignmentResultsPageViewModel,
} from '@/assignments/result-view';
import { AssignmentSettingsSummary } from '@/components/assignments/assignment-settings-summary';
import { CopyAssignmentShareLinkButton } from '@/components/assignments/copy-assignment-share-link-button';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  IconClipboardText,
  IconCopy,
  IconDownload,
  IconPlayerPlay,
  IconPrinter,
  IconShare3,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type AssignmentResultsHeaderView = NonNullable<
  ReturnType<typeof buildAssignmentResultsPageViewModel>['headerView']
>;

type AssignmentResultsHeaderCardProps = {
  assignmentId: string;
  headerView: AssignmentResultsHeaderView;
  onResultAction: (actionButton: AssignmentResultActionButton) => void;
  resultActions: AssignmentResultActionButton[];
};

export function AssignmentResultsHeaderCard({
  assignmentId,
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
        <div className="flex flex-col gap-3 sm:flex-row">
          {headerView.shareAction.isAvailable ? (
            <Link
              to="/play/$shareId"
              params={{
                shareId: headerView.shareAction.shareSlug,
              }}
              className={cn(buttonVariants(), 'w-full sm:w-auto')}
            >
              <IconPlayerPlay className="size-4" />
              {headerView.shareAction.label}
            </Link>
          ) : (
            <Button type="button" className="w-full sm:w-auto" disabled>
              <IconPlayerPlay className="size-4" />
              {headerView.shareAction.label}
            </Button>
          )}
          <div className="flex min-h-8 items-center gap-2 rounded-lg border bg-muted/30 px-3 text-sm text-muted-foreground">
            <IconShare3 className="size-4" />
            {headerView.shareAction.sharePath}
          </div>
          <CopyAssignmentShareLinkButton
            disabled={!headerView.shareAction.isAvailable}
            disabledMessage={headerView.shareAction.disabledReason}
            shareSlug={headerView.shareAction.shareSlug}
            className="w-full bg-background sm:w-auto"
          />
          <Link
            to="/print/assignments/$assignmentId"
            params={{ assignmentId }}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full bg-background sm:w-auto'
            )}
          >
            <IconPrinter className="size-4" />
            {headerView.printAction.label}
          </Link>
          {headerView.shareAction.disabledReason ? (
            <p className="basis-full text-sm text-muted-foreground">
              {headerView.shareAction.disabledReason}
            </p>
          ) : null}
          {resultActions.map((actionButton) => {
            const Icon = resultActionIconByAction[actionButton.action];

            return (
              <Button
                key={actionButton.action}
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={actionButton.disabled}
                onClick={() => onResultAction(actionButton)}
              >
                <Icon className="size-4" />
                {actionButton.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const resultActionIconByAction: Record<
  AssignmentResultActionButton['action'],
  typeof IconCopy
> = {
  'copy-brief': IconClipboardText,
  'copy-follow-up': IconCopy,
  'copy-item-review': IconCopy,
  'copy-reteach-plan': IconCopy,
  'export-csv': IconDownload,
};
