import {
  buildPrintableAssignmentSearch,
  parsePrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  PRINTABLE_WORKSHEET_BODY_PRINT_MODE,
  buildPrintableWorksheetRouteState,
} from '@/assignments/printable-worksheet-view';
import { PrintableWorksheetAnswerKey } from '@/components/assignments/printable-worksheet-answer-key';
import { PrintableWorksheetAssignmentFields } from '@/components/assignments/printable-worksheet-assignment-fields';
import { PrintableWorksheetHeader } from '@/components/assignments/printable-worksheet-header';
import { PrintableWorksheetItemList } from '@/components/assignments/printable-worksheet-item-list';
import { PrintableWorksheetPreparationSummary } from '@/components/assignments/printable-worksheet-preparation-summary';
import { PrintableWorksheetStatePanel } from '@/components/assignments/printable-worksheet-state-panel';
import { PrintableWorksheetToolbar } from '@/components/assignments/printable-worksheet-toolbar';
import { usePrintableAssignmentWorksheet } from '@/hooks/use-assignments';
import { m } from '@/locale/paraglide/messages';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seo } from '@/lib/seo';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/print/assignments/$assignmentId')({
  validateSearch: parsePrintableAssignmentSearch,
  head: () =>
    seo('/print/assignments', {
      title: m.assignment_printable_seo_title(),
      description: m.assignment_printable_seo_description(),
      robots: 'noindex, nofollow',
    }),
  ssr: false,
  server: {
    middleware: [authRouteMiddleware],
  },
  component: PrintableAssignmentWorksheetPage,
});

function PrintableAssignmentWorksheetPage() {
  const { assignmentId } = Route.useParams();
  const { answerKey = false } = Route.useSearch();
  const navigate = useNavigate({
    from: '/print/assignments/$assignmentId',
  });
  const { data, isError, isLoading } = usePrintableAssignmentWorksheet({
    assignmentId,
    includeAnswerKey: answerKey,
  });
  const routeState = buildPrintableWorksheetRouteState({
    answerKey,
    assignmentId,
    isError,
    isLoading,
    worksheet: data,
  });

  useEffect(() => {
    document.body.dataset.printMode = PRINTABLE_WORKSHEET_BODY_PRINT_MODE;

    return () => {
      if (
        document.body.dataset.printMode === PRINTABLE_WORKSHEET_BODY_PRINT_MODE
      ) {
        delete document.body.dataset.printMode;
      }
    };
  }, []);

  function updateAnswerKey(nextAnswerKey: boolean) {
    void navigate({
      replace: true,
      search: buildPrintableAssignmentSearch({ answerKey: nextAnswerKey }),
    });
  }

  if (routeState.status === 'loading') {
    return (
      <PrintableWorksheetStatePanel
        mode="loading"
        view={routeState.statePanelView}
      />
    );
  }

  if (routeState.status === 'error') {
    return (
      <PrintableWorksheetStatePanel
        mode="error"
        view={routeState.statePanelView}
      />
    );
  }

  const pageView = routeState.pageView;
  const { controlView, headerView } = pageView;

  return (
    <main
      data-print-page="assignment-worksheet"
      className="min-h-svh bg-muted/30 px-4 py-4 text-foreground sm:px-6 lg:px-8"
    >
      <div
        data-print-shell
        className="mx-auto grid max-w-5xl gap-4 rounded-lg border bg-background p-4 shadow-sm sm:p-6 print:shadow-none"
      >
        <PrintableWorksheetToolbar
          controlView={controlView}
          onAnswerKeyChange={updateAnswerKey}
          onPrint={() => window.print()}
        />

        <article data-print-root className="grid gap-6">
          <PrintableWorksheetHeader headerView={headerView} />

          <PrintableWorksheetPreparationSummary
            view={pageView.preparationView}
          />

          <PrintableWorksheetAssignmentFields
            fieldViews={pageView.assignmentFieldViews}
          />

          <PrintableWorksheetItemList
            emptyState={pageView.emptyState}
            itemViews={pageView.itemViews}
          />

          <PrintableWorksheetAnswerKey view={pageView.answerKeyView} />
        </article>
      </div>
    </main>
  );
}
