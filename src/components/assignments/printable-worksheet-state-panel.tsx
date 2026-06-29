import type { PrintableWorksheetLoadStateView } from '@/assignments/printable-worksheet-view';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

type PrintableWorksheetStatePanelProps =
  | {
      mode: 'loading';
      view: PrintableWorksheetLoadStateView;
    }
  | {
      mode: 'error';
      view: PrintableWorksheetLoadStateView;
    };

export function PrintableWorksheetStatePanel({
  mode,
  view,
}: PrintableWorksheetStatePanelProps) {
  if (mode === 'loading') {
    return (
      <main
        data-print-page="assignment-worksheet"
        className="flex min-h-svh items-center justify-center bg-muted/20 p-6"
      >
        <Spinner className="size-6" />
        <span className="sr-only">{view.message}</span>
      </main>
    );
  }

  return (
    <main
      data-print-page="assignment-worksheet"
      className="mx-auto grid min-h-svh max-w-3xl place-items-center p-6"
    >
      <Card className="w-full rounded-lg">
        <CardContent className="p-6 text-sm text-destructive">
          {view.message}
        </CardContent>
      </Card>
    </main>
  );
}
