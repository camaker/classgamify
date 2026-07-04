import { Markdown } from '@/components/markdown/markdown';
import { Card, CardContent } from '@/components/ui/card';
import type { PageDoc } from '@/lib/pages';
import { formatDate } from '@/lib/formatter';

type MarkdownPageHandoffView = {
  description: string;
  itemViews: {
    ariaLabel: string;
    description: string;
    id: string;
    label: string;
    value: string;
  }[];
  title: string;
};

export function MarkdownPage({
  handoffView,
  page,
}: {
  handoffView?: MarkdownPageHandoffView;
  page: PageDoc;
}) {
  const { title, description, date, content } = page;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-center text-lg text-muted-foreground">
            {description}
          </p>
        )}
        {date && (
          <p className="text-center text-sm text-muted-foreground">
            {formatDate(new Date(date))}
          </p>
        )}
      </div>
      <Card className="ring-0 border border-border">
        <CardContent>
          <Markdown
            content={content}
            className="prose prose-neutral dark:prose-invert max-w-none"
          />
        </CardContent>
      </Card>
      {handoffView ? <MarkdownPageHandoff view={handoffView} /> : null}
    </div>
  );
}

function MarkdownPageHandoff({ view }: { view: MarkdownPageHandoffView }) {
  const titleId = 'markdown-page-legal-policy-handoff-title';
  const descriptionId = 'markdown-page-legal-policy-handoff-description';

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="sr-only"
      data-handoff="legal-policy"
    >
      <h2 id={titleId}>{view.title}</h2>
      <p id={descriptionId}>{view.description}</p>
      <dl>
        {view.itemViews.map((itemView) => (
          <MarkdownPageHandoffItem itemView={itemView} key={itemView.id} />
        ))}
      </dl>
    </section>
  );
}

function MarkdownPageHandoffItem({
  itemView,
}: {
  itemView: MarkdownPageHandoffView['itemViews'][number];
}) {
  return (
    <div data-handoff-item={itemView.id}>
      <dt>{itemView.label}</dt>
      <dd>
        <output aria-label={itemView.ariaLabel}>{itemView.value}</output>
        <span>{itemView.description}</span>
      </dd>
    </div>
  );
}
