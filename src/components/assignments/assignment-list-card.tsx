import type { buildAssignmentListCardViewModel } from '@/assignments/list-view';
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
import { useUpdateAssignmentStatus } from '@/hooks/use-assignments';
import { cn } from '@/lib/utils';
import {
  IconChartBar,
  IconListCheck,
  IconLock,
  IconLockOpen,
  IconPlayerPlay,
  IconPrinter,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

type AssignmentListCardProps = {
  assignment: ReturnType<typeof buildAssignmentListCardViewModel>;
};

export function AssignmentListCard({ assignment }: AssignmentListCardProps) {
  const updateStatusMutation = useUpdateAssignmentStatus();
  const { printAction, resultAction, shareAction, statusAction } =
    assignment.actionView;

  async function updateStatus() {
    if (!statusAction) return;

    try {
      await updateStatusMutation.mutateAsync({
        assignmentId: assignment.id,
        status: statusAction.nextStatus,
      });
      toast.success(statusAction.successMessage);
    } catch {
      toast.error(statusAction.failureMessage);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {assignment.statusLabel}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            <IconListCheck className="size-3.5" />
            {assignment.templateLabel}
          </Badge>
        </div>
        <CardTitle>
          <h2 className="text-lg font-semibold">{assignment.title}</h2>
        </CardTitle>
        <CardDescription>
          <p>{assignment.activityDescription}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-4">
          <AssignmentSettingsSummary
            expiresAt={assignment.expiresAt}
            settings={assignment.settings}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {assignment.statItems.map((stat) => (
              <AssignmentStat
                key={stat.key}
                icon={assignmentListCardStatIcons[stat.key]}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {resultAction ? (
            <Link
              to="/dashboard/assignments/$assignmentId"
              params={{ assignmentId: resultAction.assignmentId }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background lg:w-auto'
              )}
            >
              <IconChartBar className="size-4" />
              {resultAction.label}
            </Link>
          ) : null}
          {printAction ? (
            <Link
              to="/print/assignments/$assignmentId"
              params={{ assignmentId: printAction.assignmentId }}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full bg-background lg:w-auto'
              )}
            >
              <IconPrinter className="size-4" />
              {printAction.label}
            </Link>
          ) : null}
          {statusAction ? (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-background lg:w-auto"
              disabled={updateStatusMutation.isPending}
              onClick={updateStatus}
            >
              {statusAction.kind === 'close-link' ? (
                <IconLock className="size-4" />
              ) : (
                <IconLockOpen className="size-4" />
              )}
              {statusAction.label}
            </Button>
          ) : null}
          {shareAction ? (
            <>
              <Link
                to="/play/$shareId"
                params={{ shareId: shareAction.shareSlug }}
                className={cn(buttonVariants(), 'w-full lg:w-auto')}
              >
                <IconPlayerPlay className="size-4" />
                {shareAction.label}
              </Link>
              <CopyAssignmentShareLinkButton
                shareSlug={shareAction.shareSlug}
                className="w-full bg-background lg:w-auto"
              />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

const assignmentListCardStatIcons: Record<
  ReturnType<
    typeof buildAssignmentListCardViewModel
  >['statItems'][number]['key'],
  typeof IconUsers
> = {
  average: IconChartBar,
  completions: IconUsers,
};

function AssignmentStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUsers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
