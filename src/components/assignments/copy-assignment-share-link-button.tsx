import {
  buildAssignmentShareLinkCopyExecutionPlan,
  type AssignmentShareLinkDisabledReasonCode,
} from '@/assignments/share-link';
import { Button } from '@/components/ui/button';
import { copyTextToClipboard } from '@/lib/clipboard';
import { IconCopy } from '@tabler/icons-react';
import type { ComponentProps } from 'react';
import { toast } from 'sonner';

export function CopyAssignmentShareLinkButton({
  className,
  descriptionId,
  disabled,
  disabledReasonCode,
  disabledMessage,
  disabledReasonId,
  label,
  shareSlug,
  shareUrl,
  size,
  variant = 'outline',
}: {
  className?: string;
  descriptionId?: string;
  disabled?: boolean;
  disabledReasonCode?: AssignmentShareLinkDisabledReasonCode;
  disabledMessage?: string;
  disabledReasonId?: string;
  label: string;
  shareSlug: string;
  shareUrl?: string;
  size?: ComponentProps<typeof Button>['size'];
  variant?: ComponentProps<typeof Button>['variant'];
}) {
  async function copyShareLink() {
    const executionPlan = buildAssignmentShareLinkCopyExecutionPlan({
      disabled,
      disabledReasonCode,
      disabledMessage,
      shareSlug,
      shareUrl,
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
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      aria-describedby={buildShareLinkButtonDescriptionIds(
        descriptionId,
        disabled ? disabledReasonId : undefined
      )}
      onClick={copyShareLink}
    >
      <IconCopy aria-hidden="true" className="size-4" />
      {label}
    </Button>
  );
}

function buildShareLinkButtonDescriptionIds(...ids: Array<string | undefined>) {
  const descriptionIds = ids.filter(Boolean).join(' ');
  return descriptionIds || undefined;
}
