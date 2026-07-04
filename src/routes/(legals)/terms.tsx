import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { MarkdownPage } from '@/components/page/markdown-page';
import { getPageBySlug } from '@/lib/pages';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { buildLegalPolicyPageViewModel } from '@/pages/legal-policy-view';

export const Route = createFileRoute('/(legals)/terms')({
  loader: () => {
    const page = getPageBySlug('terms');
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.page;
    if (!p) return {};
    return seo('/terms', {
      title: `${p.title} | ${websiteConfig.metadata?.name}`,
      description: p.description,
    });
  },
  component: TermsPage,
});

function TermsPage() {
  const { page } = Route.useLoaderData();
  if (!page) throw notFound();
  const pageView = buildLegalPolicyPageViewModel({
    page,
    policyId: 'terms',
  });

  return (
    <Container className="py-16 px-4">
      <MarkdownPage handoffView={pageView.handoffView} page={pageView.page} />
    </Container>
  );
}
