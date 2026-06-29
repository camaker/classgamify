import type { PrintableWorksheetControlView } from '@/assignments/printable-worksheet-view';
import { Button, buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

type PrintableWorksheetToolbarProps = {
  controlView: PrintableWorksheetControlView;
  onAnswerKeyChange: (answerKey: boolean) => void;
  onPrint: () => void;
};

export function PrintableWorksheetToolbar({
  controlView,
  onAnswerKeyChange,
  onPrint,
}: PrintableWorksheetToolbarProps) {
  const { backToResultsAction } = controlView;

  return (
    <div
      data-print-hidden
      className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <Link
        to={backToResultsAction.to}
        params={{ assignmentId: backToResultsAction.assignmentId }}
        className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
      >
        <IconArrowLeft className="size-4" />
        {backToResultsAction.label}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          htmlFor="printable-answer-key"
          className="flex items-start gap-2 text-sm"
        >
          <Switch
            id="printable-answer-key"
            checked={controlView.answerKeyValue}
            onCheckedChange={onAnswerKeyChange}
          />
          <span className="grid gap-1">
            <span>{controlView.answerKeyLabel}</span>
            <span className="max-w-64 text-muted-foreground text-xs leading-snug">
              {controlView.answerKeyDescription}
            </span>
          </span>
        </label>
        <Button type="button" onClick={onPrint}>
          <IconPrinter className="size-4" />
          {controlView.printButtonLabel}
        </Button>
      </div>
    </div>
  );
}
