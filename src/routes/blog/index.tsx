import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPagination } from '@/components/blog/blog-pagination';
import { BlogCtaActionLink } from '@/components/blog/blog-cta-action-link';
import Container from '@/components/layout/container';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { getPaginatedPosts } from '@/lib/blog';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getBlogCtaActions } from '@/pages/blog-page-view';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: parseBlogPageSearch(search.page),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps }) => getPaginatedPosts(deps.page),
  head: () => {
    return seo(Routes.Blog, {
      title: `${m.blog_page_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.blog_page_seo_description(),
    });
  },
  component: BlogListPage,
});

function BlogListPage() {
  const { currentPage, posts, totalPages } = Route.useLoaderData();
  const ctaActions = getBlogCtaActions();

  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-sm font-medium text-primary">
            {m.blog_page_eyebrow()}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {m.blog_page_title()}
          </h1>
          <p className="text-muted-foreground">{m.blog_page_description()}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border bg-muted/20 p-3">
          {ctaActions.map((action) => (
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

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}
