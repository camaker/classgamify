import { HskCoursePage } from '@/components/learn/hsk-course-page';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getCanonicalUrl } from '@/lib/urls';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/hsk/1')({
  head: () => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `HSK1 汉字学习路径 | ${websiteConfig.metadata?.name}`
        : `HSK1 Chinese Character Learning Path | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? '查看 Lang Study 的 HSK1 汉字入门路径：免费描写练习、字卡详情、可打印练习纸和完整课程包入口。'
        : 'Explore the Lang Study HSK1 character path with free tracing practice, character detail cards, printable worksheets, and the complete course pack.';
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
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(courseJsonLd),
        },
      ],
    };
  },
  component: HskCoursePage,
});
