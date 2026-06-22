import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPagination } from '@/components/blog/blog-pagination';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { getPaginatedPosts } from '@/lib/blog';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import {
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
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
          <Link to={Routes.Create} className={buttonVariants()}>
            <IconPlus className="size-4" />
            {m.blog_page_create_activity()}
          </Link>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconLayoutGrid className="size-4" />
            {m.blog_page_browse_templates()}
          </Link>
          <Link
            to={Routes.PlayDemo}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconDeviceGamepad2 className="size-4" />
            {m.blog_page_student_preview()}
          </Link>
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
