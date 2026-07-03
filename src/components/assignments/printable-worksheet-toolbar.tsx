import type {
  PrintableWorksheetAnswerKeyToggleView,
  PrintableWorksheetBackToResultsAction,
  PrintableWorksheetControlView,
  PrintableWorksheetPrintAction,
} from '@/assignments/printable-worksheet-view';
import { Badge } from '@/components/ui/badge';
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
  const answerKeyDescriptionId = 'printable-answer-key-description';
  const answerKeyStatusDescriptionId =
    'printable-answer-key-status-description';
  const answerKeyLabelId = 'printable-answer-key-label';
  const answerKeyStatusLabelId = 'printable-answer-key-status-label';
  const answerKeyStatusValueId = 'printable-answer-key-status-value';

  return (
    <label
      htmlFor="printable-answer-key"
      className="flex items-start gap-2 text-sm"
    >
      <Switch
        id="printable-answer-key"
        checked={toggleView.value}
        aria-describedby={`${answerKeyDescriptionId} ${answerKeyStatusDescriptionId}`}
        aria-labelledby={answerKeyLabelId}
        onCheckedChange={onAnswerKeyChange}
      />
      <span className="grid gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span id={answerKeyLabelId}>{toggleView.label}</span>
          <Badge
            aria-describedby={answerKeyStatusDescriptionId}
            aria-labelledby={`${answerKeyStatusLabelId} ${answerKeyStatusValueId}`}
            className="rounded-md"
            data-print-answer-key-state={toggleView.accessView.state}
            variant="outline"
          >
            <span id={answerKeyStatusLabelId} className="sr-only">
              {toggleView.accessView.label}
            </span>
            <output
              aria-describedby={answerKeyStatusDescriptionId}
              aria-label={toggleView.accessView.ariaLabel}
              aria-labelledby={`${answerKeyStatusLabelId} ${answerKeyStatusValueId}`}
              id={answerKeyStatusValueId}
            >
              {toggleView.accessView.value}
            </output>
          </Badge>
        </span>
        <span
          id={answerKeyDescriptionId}
          className="max-w-64 text-muted-foreground text-xs leading-snug"
        >
          {toggleView.description}
        </span>
        <span id={answerKeyStatusDescriptionId} className="sr-only">
          {toggleView.accessView.description}
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
  const printDescriptionId = 'printable-worksheet-print-description';

  return (
    <>
      <Button
        type="button"
        aria-describedby={printDescriptionId}
        onClick={onPrint}
      >
        <IconPrinter aria-hidden="true" className="size-4" />
        {action.label}
      </Button>
      <span id={printDescriptionId} className="sr-only">
        {action.description}
      </span>
    </>
  );
}

function PrintableWorksheetBackToResultsLink({
  action,
}: {
  action: PrintableWorksheetBackToResultsAction;
}) {
  const labelId = 'printable-worksheet-back-to-results-label';

  return (
    <Link
      to={action.to}
      params={{ assignmentId: action.assignmentId }}
      aria-labelledby={labelId}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
    >
      <IconArrowLeft aria-hidden="true" className="size-4" />
      <span id={labelId}>{action.label}</span>
    </Link>
  );
}
