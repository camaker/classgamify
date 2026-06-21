import {
  assignmentShareLinkActionCopy,
  buildAssignmentShareUrl,
} from '@/assignments/share-link';
import { Button } from '@/components/ui/button';
import { copyTextToClipboard } from '@/lib/clipboard';
import { IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';

export function CopyAssignmentShareLinkButton({
  className,
  shareSlug,
}: {
  className?: string;
  shareSlug: string;
}) {
  async function copyShareLink() {
    try {
      await copyTextToClipboard(buildAssignmentShareUrl(shareSlug));
      toast.success(assignmentShareLinkActionCopy.successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : assignmentShareLinkActionCopy.failureMessage
      );
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={copyShareLink}
    >
      <IconCopy className="size-4" />
      {assignmentShareLinkActionCopy.copyLabel}
    </Button>
  );
}
