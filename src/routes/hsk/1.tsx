import { HskCoursePage } from '@/components/learn/hsk-course-page';
import { websiteConfig } from '@/config/website';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getCanonicalUrl } from '@/lib/urls';
import { createFileRoute } from '@tanstack/react-router';
import { jsonLdScript } from '@/lib/structured-data';

export const Route = createFileRoute('/hsk/1')({
  head: () => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `HSK1 汉字学习路径 | ${websiteConfig.metadata?.name}`
        : `HSK1 Chinese Character Learning Path | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? '查看 Lang Study 的免费 50 字 HSK1 第一阶段路径：描写练习、字卡详情、复习队列和可打印练习纸。'
        : 'Explore the free 50-character Lang Study HSK1 launch path with tracing practice, character detail cards, review cues, and printable worksheets.';
    const url = getCanonicalUrl(Routes.Hsk1);
    const courseJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: title,
      description,
      url,
      inLanguage: localeConfig[getLocale()].hreflang,
      provider: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? '',
      },
      educationalLevel: 'Beginner',
      teaches: currentLocale === 'zh' ? 'HSK1 汉字书写' : 'HSK1 Hanzi writing',
    };
    const metadata = seo(Routes.Hsk1, { title, description });

    return {
      ...metadata,
      scripts: [jsonLdScript(courseJsonLd)],
    };
  },
  component: HskCoursePage,
});
