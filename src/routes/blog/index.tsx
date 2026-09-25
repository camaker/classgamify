import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPagination } from '@/components/blog/blog-pagination';
import { BlogCtaActionLink } from '@/components/blog/blog-cta-action-link';
import Container from '@/components/layout/container';
import { websiteConfig } from '@/config/website';
import {
  getBlogIndexingPolicy,
  getBlogLocalesWithPosts,
  getPaginatedPosts,
} from '@/lib/blog';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getCanonicalUrlForLocale } from '@/lib/urls';
import { buildBlogListPageViewModel } from '@/pages/blog-page-view';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/')({
  beforeLoad: () => {
    const policy = getBlogIndexingPolicy(
      getBlogLocalesWithPosts(),
      getLocale()
    );
    if (!policy.indexable) {
      throw redirect({
        href: getCanonicalUrlForLocale(Routes.Blog, policy.canonicalLocale),
        reloadDocument: true,
        statusCode: 308,
      });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    page: parseBlogPageSearch(search.page),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => getPaginatedPosts(deps.page),
  head: () => {
    const pageView = buildBlogListPageViewModel();
    const policy = getBlogIndexingPolicy(
      getBlogLocalesWithPosts(),
      getLocale()
    );

    return seo(Routes.Blog, {
      title: `${pageView.seoTitle} | ${websiteConfig.metadata?.name}`,
      description: pageView.seoDescription,
      alternateLocales: policy.alternateLocales,
      canonicalLocale: policy.canonicalLocale,
      robots: policy.indexable ? undefined : 'noindex,follow',
    });
  },
  component: BlogListPage,
});

function BlogListPage() {
  const { currentPage, posts, totalPages } = Route.useLoaderData();
  const pageView = buildBlogListPageViewModel();

  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-sm font-medium text-primary">{pageView.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {pageView.title}
          </h1>
          <p className="text-muted-foreground">{pageView.description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border bg-muted/20 p-3">
          {pageView.ctaActions.map((action) => (
            <BlogCtaActionLink action={action} key={action.id} />
          ))}
        </div>
        <BlogGrid posts={posts} />
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </Container>
  );
}

function parseBlogPageSearch(value: unknown) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const parsedValue =
    typeof normalizedValue === 'number'
      ? normalizedValue
      : Number(normalizedValue);

  return Number.isInteger(parsedValue) && parsedValue > 1
    ? parsedValue
    : undefined;
}
