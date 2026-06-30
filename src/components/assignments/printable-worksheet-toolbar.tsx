import type {
  PrintableWorksheetAnswerKeyToggleView,
  PrintableWorksheetBackToResultsAction,
  PrintableWorksheetControlView,
  PrintableWorksheetPrintAction,
} from '@/assignments/printable-worksheet-view';
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
  const { answerKeyToggle, backToResultsAction, printAction } = controlView;

  return (
    <div
      data-print-hidden
      className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <PrintableWorksheetBackToResultsLink action={backToResultsAction} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PrintableWorksheetAnswerKeyToggle
          onAnswerKeyChange={onAnswerKeyChange}
          toggleView={answerKeyToggle}
        />
        <PrintableWorksheetPrintButton action={printAction} onPrint={onPrint} />
      </div>
    </div>
  );
}

function PrintableWorksheetAnswerKeyToggle({
  onAnswerKeyChange,
  toggleView,
}: {
  onAnswerKeyChange: (answerKey: boolean) => void;
  toggleView: PrintableWorksheetAnswerKeyToggleView;
}) {
  return (
    <label
      htmlFor="printable-answer-key"
      className="flex items-start gap-2 text-sm"
    >
      <Switch
        id="printable-answer-key"
        checked={toggleView.value}
        onCheckedChange={onAnswerKeyChange}
      />
      <span className="grid gap-1">
        <span>{toggleView.label}</span>
        <span className="max-w-64 text-muted-foreground text-xs leading-snug">
          {toggleView.description}
        </span>
      </span>
    </label>
  );
}

function PrintableWorksheetPrintButton({
  action,
  onPrint,
}: {
  action: PrintableWorksheetPrintAction;
  onPrint: () => void;
}) {
  return (
    <Button type="button" onClick={onPrint}>
      <IconPrinter className="size-4" />
      {action.label}
    </Button>
  );
}

function PrintableWorksheetBackToResultsLink({
  action,
}: {
  action: PrintableWorksheetBackToResultsAction;
}) {
  return (
    <Link
      to={action.to}
      params={{ assignmentId: action.assignmentId }}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
    >
      <IconArrowLeft className="size-4" />
      {action.label}
    </Link>
  );
}
