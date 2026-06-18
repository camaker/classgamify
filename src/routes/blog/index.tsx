import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPagination } from '@/components/blog/blog-pagination';
import Container from '@/components/layout/container';
import { websiteConfig } from '@/config/website';
import { getPaginatedPosts } from '@/lib/blog';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: parseBlogPageSearch(search.page),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps }) => getPaginatedPosts(deps.page),
  head: () => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `汉字学习文章 | ${websiteConfig.metadata?.name}`
        : `Chinese Character Learning Articles | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? '阅读 Lang Study 关于中文汉字书写、HSK1 练习、打印练习纸和课堂使用的产品文章。'
        : 'Read Lang Study articles about Chinese character handwriting, HSK1 practice, printable worksheets, and classroom use.';

    return seo(Routes.Blog, { title, description });
  },
  component: BlogListPage,
});

function BlogListPage() {
  const { currentPage, posts, totalPages } = Route.useLoaderData();
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-sm font-medium text-primary">
            {currentLocale === 'zh' ? '学习方法' : 'Learning notes'}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {currentLocale === 'zh'
              ? '汉字书写、复习和练习纸'
              : 'Chinese character writing, review, and worksheets'}
          </h1>
          <p className="text-muted-foreground">
            {currentLocale === 'zh'
              ? '围绕 HSK1 汉字、纸笔练习和课堂作业流程的短文章。'
              : 'Short articles about HSK1 characters, paper practice, and classroom assignment workflows.'}
          </p>
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
