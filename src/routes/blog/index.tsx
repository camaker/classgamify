import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogPagination } from '@/components/blog/blog-pagination';
import Container from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { getPaginatedPosts } from '@/lib/blog';
import { getLocale } from '@/lib/locale';
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
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `课堂活动资源 | ${websiteConfig.metadata?.name}`
        : `Classroom Activity Resources | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? '阅读 ClassGamify 关于游戏化活动、作业链接、课堂模板和 AI 辅助创建的产品文章。'
        : 'Read ClassGamify articles about game-based activities, assignment links, classroom templates, and AI-assisted creation.';

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
            {currentLocale === 'zh' ? '课堂活动' : 'Classroom activities'}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {currentLocale === 'zh'
              ? '模板、作业和游戏化课堂'
              : 'Templates, assignments, and classroom games'}
          </h1>
          <p className="text-muted-foreground">
            {currentLocale === 'zh'
              ? '围绕老师创建活动、发布作业和用 AI 加速备课的短文章。'
              : 'Short articles about teacher activity creation, publishing assignments, and using AI to speed up prep.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border bg-muted/20 p-3">
          <Link to={Routes.Create} className={buttonVariants()}>
            <IconPlus className="size-4" />
            {currentLocale === 'zh' ? '创建活动' : 'Create activity'}
          </Link>
          <Link
            to={Routes.Templates}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconLayoutGrid className="size-4" />
            {currentLocale === 'zh' ? '浏览模板' : 'Browse templates'}
          </Link>
          <Link
            to={Routes.PlayDemo}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconDeviceGamepad2 className="size-4" />
            {currentLocale === 'zh' ? '学生预览' : 'Student preview'}
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
