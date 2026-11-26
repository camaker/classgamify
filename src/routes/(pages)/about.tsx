import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import { getBaseUrl, getCanonicalUrl } from '@/lib/urls';
import {
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
} from '@/lib/structured-data';
import { seo } from '@/lib/seo';
import { getLocale, localeConfig } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { Link, createFileRoute } from '@tanstack/react-router';

const ABOUT_EN_DESCRIPTION =
  'What ClassGamify is, who it is for, how student data and AI drafts are handled, and how to contact us about schools and learning centers.';

/** English-only trust copy; facts mirror the privacy policy and product docs. */
const ABOUT_EN_SECTIONS = [
  {
    title: 'What ClassGamify is',
    body: 'ClassGamify is a classroom activity platform for teachers. You write an activity once, using questions, word pairs, groups, or sentences, then choose a game or worksheet template, publish one student link, and read the results afterwards. The same content can be played as a quiz, a matching game, line matching, a sorting task, fill in the blank, a listening activity, or open the box.',
  },
  {
    title: 'Who it is for',
    body: 'Teachers, tutors, and learning centers who want short, repeatable practice activities. Students do not need an account. They open the link in a browser, type a name if the teacher collects names, and play.',
  },
  {
    title: 'How student data is handled',
    body: 'When a student plays an assignment, ClassGamify may process the student name, only if the teacher chooses to collect it, an anonymous browser token used for attempt limits, the submitted answers, the score, and the completion time. Teachers see this as results and CSV exports. Teachers decide whether to collect names and who receives the link, and should not ask students for sensitive personal information.',
    link: { href: '/privacy', label: 'Read the privacy policy' },
  },
  {
    title: 'How AI drafts work',
    body: 'AI drafting is optional. When you ask for a draft from your lesson material, it opens in the editor for you to review and change. Nothing reaches students until you publish an assignment.',
  },
] as const;

export const Route = createFileRoute('/(pages)/about')({
  head: () => {
    const title = m.nav_about_title();
    // /about is indexed in English only. Its description must differ from
    // /teachers, which reuses the shared teachers_page_seo_description.
    const description =
      getLocale() === 'en'
        ? ABOUT_EN_DESCRIPTION
        : m.teachers_page_seo_description();
    const url = getCanonicalUrl(Routes.About);
    const baseUrl = getBaseUrl().replace(/\/$/, '');
    return {
      ...seo(Routes.About, {
        title,
        description,
      }),
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            {
              '@type': 'AboutPage',
              '@id': `${url}#about`,
              name: title,
              description,
              url,
              inLanguage: localeConfig[getLocale()].hreflang,
              about: { '@id': `${baseUrl}/#organization` },
            },
          ])
        ),
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  return (
    <Container className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-4xl space-y-12 pb-16">
        <header className="space-y-5">
          <p className="font-semibold text-primary text-xs uppercase">
            {m.teachers_page_eyebrow()}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {m.nav_about_title()}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            {m.teachers_page_description()}
          </p>
        </header>

        {getLocale() === 'en'
          ? ABOUT_EN_SECTIONS.map((section) => (
              <section className="space-y-3" key={section.title}>
                <h2 className="text-2xl font-semibold tracking-normal">
                  {section.title}
                </h2>
                <p className="text-base leading-8 text-muted-foreground">
                  {section.body}
                </p>
                {'link' in section ? (
                  <Link
                    to={section.link.href}
                    className="font-medium text-primary text-sm underline-offset-4 hover:underline"
                  >
                    {section.link.label}
                  </Link>
                ) : null}
              </section>
            ))
          : null}

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-semibold">
            {m.teachers_page_school_cta_title()}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {m.teachers_page_school_cta_description()}
          </p>
          <Link
            to={Routes.Contact}
            className={cn(buttonVariants(), 'mt-4 w-full sm:w-auto')}
          >
            {m.teachers_page_school_cta()}
          </Link>
        </section>
      </div>
    </Container>
  );
}
