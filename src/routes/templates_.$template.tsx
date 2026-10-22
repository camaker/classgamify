import { getActivityTemplates } from '@/activities/catalog';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  graphJsonLd,
  jsonLdScript,
} from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import {
  getTemplateDetailGuide,
  TEMPLATE_GUIDE_PATHS,
  type TemplateDetailGuide,
} from '@/pages/template-guide-content';
import {
  IconArrowRight,
  IconBulb,
  IconLayoutGrid,
  IconListNumbers,
} from '@tabler/icons-react';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

const TEMPLATES_BREADCRUMB_LABEL = 'Classroom game templates';

export const Route = createFileRoute('/templates_/$template')({
  loader: ({ params }) => {
    if (getLocale() !== 'en') throw notFound();

    // Quiz and matching pairs keep their dedicated guide URLs.
    if (params.template === 'quiz' || params.template === 'matching-pairs') {
      throw redirect({
        href: TEMPLATE_GUIDE_PATHS[params.template],
        statusCode: 308,
      });
    }

    const guide = getTemplateDetailGuide(params.template);
    if (!guide) throw notFound();

    return {
      example: buildGuideExample(guide),
      guide,
      related: getActivityTemplates()
        .filter((template) => template.type !== guide.type)
        .map((template) => ({
          description: template.description,
          href: TEMPLATE_GUIDE_PATHS[template.type],
          name: template.name,
          type: template.type,
        })),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { guide } = loaderData;
    const path = TEMPLATE_GUIDE_PATHS[guide.type];

    return {
      ...seo(path, {
        title: `${guide.seoTitle} | ${websiteConfig.metadata?.name}`,
        description: guide.description,
        alternateLocales: ['en'],
        canonicalLocale: 'en',
      }),
      scripts: [
        jsonLdScript(
          graphJsonLd([
            breadcrumbJsonLd([
              { name: TEMPLATES_BREADCRUMB_LABEL, path: Routes.Templates },
              { name: guide.breadcrumbLabel, path },
            ]),
            faqPageJsonLd({ faqs: guide.faqs, path }),
          ])
        ),
      ],
    };
  },
  component: TemplateGuidePage,
});

type GuideExample = {
  rows: Array<{ id: string; left: string; right: string }>;
  title: string;
};

function buildGuideExample(guide: TemplateDetailGuide): GuideExample {
  const scaffold = getActivityTemplateScaffold(guide.type);
  const splitLine = (line: string) =>
    line.split('|').map((part) => part.trim());

  if (guide.exampleShape === 'pairs') {
    return {
      title: scaffold.title,
      rows: scaffold.pairsText
        .split('\n')
        .map(splitLine)
        .filter(([left, right]) => left && right)
        .slice(0, 5)
        .map(([left, right], index) => ({
          id: `pair-${index}`,
          left: left ?? '',
          right: right ?? '',
        })),
    };
  }

  if (guide.exampleShape === 'groups') {
    return {
      title: scaffold.title,
      rows: scaffold.groupsText
        .split('\n')
        .map(splitLine)
        .filter(([group, items]) => group && items)
        .map(([group, items], index) => ({
          id: `group-${index}`,
          left: group ?? '',
          right: (items ?? '')
            .split(',')
            .map((item) => item.trim())
            .join(', '),
        })),
    };
  }

  return {
    title: scaffold.title,
    rows: scaffold.questionsText
      .split('\n')
      .map(splitLine)
      .filter(([prompt, answer]) => prompt && answer)
      .slice(0, 4)
      .map(([prompt, answer], index) => ({
        id: `question-${index}`,
        left: prompt ?? '',
        right: answer ?? '',
      })),
  };
}

const exampleColumnLabels = {
  groups: ['Group', 'Items students sort into it'],
  pairs: ['Prompt', 'Match'],
  questions: ['Prompt students see', 'Expected answer'],
} as const;

function TemplateGuidePage() {
  const { example, guide, related } = Route.useLoaderData();
  const createHref = `${Routes.Create}?source=templates&template=${guide.type}`;
  const [leftLabel, rightLabel] =
    guide.exampleColumnLabels ?? exampleColumnLabels[guide.exampleShape];

  return (
    <Container className="px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl space-y-16 pb-16">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <a
            className="hover:text-foreground hover:underline"
            href={Routes.Templates}
          >
            {TEMPLATES_BREADCRUMB_LABEL}
          </a>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-foreground">{guide.breadcrumbLabel}</span>
        </nav>

        <section className="grid gap-10 border-b pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="rounded-md border-primary/30">
              <IconLayoutGrid className="size-3.5" />
              Free classroom game template
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
                {guide.h1}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                {guide.intro}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'w-fit rounded-lg'
                )}
                href={createHref}
              >
                {guide.createLabel}
                <IconArrowRight className="size-4" />
              </a>
              <a
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-fit rounded-lg bg-background'
                )}
                href={Routes.Templates}
              >
                Browse all templates
              </a>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              The editor opens with the example below already filled in. A free
              teacher account is needed to save the activity and publish a
              student link.
            </p>
          </div>

          <aside className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <p className="border-b pb-4 font-medium text-primary text-sm">
              Editable starter example
            </p>
            <h2 className="mt-5 text-lg font-semibold">{example.title}</h2>
            <table className="mt-5 w-full text-left text-sm">
              <caption className="sr-only">{guide.exampleCaption}</caption>
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium" scope="col">
                    {leftLabel}
                  </th>
                  <th className="pb-2 font-medium" scope="col">
                    {rightLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {example.rows.map((row) => (
                  <tr className="border-b last:border-0" key={row.id}>
                    <td className="py-3 pr-4 font-medium">{row.left}</td>
                    <td className="py-3 text-muted-foreground">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              This is the teacher's answer list from the food-words starter.
              Replace it with content from your own lesson in the editor.
            </p>
          </aside>
        </section>

        <section aria-labelledby="template-uses-heading" className="space-y-7">
          <h2 id="template-uses-heading" className="text-3xl font-semibold">
            Ways teachers use the {guide.breadcrumbLabel.toLowerCase()} template
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {guide.useCases.map((useCase) => (
              <div
                className="rounded-lg border bg-card p-5"
                key={useCase.title}
              >
                <h3 className="text-lg font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {useCase.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <IconListNumbers
              className="size-6 text-primary"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold">What students do</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-7 text-muted-foreground">
              {guide.studentSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <IconBulb className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Tips for a good set</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-muted-foreground">
              {guide.teacherTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="template-faq-heading" className="space-y-6">
          <h2 id="template-faq-heading" className="text-3xl font-semibold">
            Frequently asked questions
          </h2>
          <dl className="grid gap-4 md:grid-cols-2">
            {guide.faqs.map((faq) => (
              <div className="rounded-lg border bg-card p-5" key={faq.question}>
                <dt className="font-semibold">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="template-related-heading"
          className="space-y-6 rounded-xl border bg-muted/30 p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <h2
                id="template-related-heading"
                className="text-2xl font-semibold"
              >
                Other classroom game templates
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                One activity can play in several formats after you save it, so
                you can reuse the same content for a different kind of practice.
              </p>
            </div>
            <a
              className={cn(buttonVariants(), 'w-fit rounded-lg')}
              href={createHref}
            >
              {guide.createLabel}
              <IconArrowRight className="size-4" />
            </a>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((template) => (
              <li key={template.type}>
                <a
                  className="block h-full rounded-lg border bg-card p-4 hover:border-primary/50"
                  href={template.href}
                >
                  <span className="font-medium text-primary">
                    {template.name}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {template.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
