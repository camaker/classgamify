import {
  buildAssignmentShareLinkCopyExecutionPlan,
  type AssignmentShareLinkDisabledReasonCode,
} from '@/assignments/share-link';
import { Button } from '@/components/ui/button';
import { copyTextToClipboard } from '@/lib/clipboard';
import { IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';

export function CopyAssignmentShareLinkButton({
  className,
  disabled,
  disabledReasonCode,
  disabledMessage,
  label,
  shareSlug,
}: {
  className?: string;
  disabled?: boolean;
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  disabledMessage?: string;
  label: string;
  shareSlug: string;
}) {
  async function copyShareLink() {
    const executionPlan = buildAssignmentShareLinkCopyExecutionPlan({
      disabled,
      disabledReasonCode,
      disabledMessage,
      shareSlug,
    });
    if (executionPlan.type === 'blocked') {
      toast.error(executionPlan.message);
      return;
    }

    try {
      await copyTextToClipboard(executionPlan.url);
      toast.success(executionPlan.successMessage);
    } catch {
      toast.error(executionPlan.failureMessage);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={disabled}
      onClick={copyShareLink}
    >
      <IconCopy className="size-4" />
      {label}
    </Button>
  );
}
