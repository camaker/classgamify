import { HanziPracticePage } from '@/components/learn/hanzi-practice-page';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { getLocale, localeConfig } from '@/lib/locale';
import { createFileRoute } from '@tanstack/react-router';
import {
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/structured-data';

export const Route = createFileRoute('/')({
  head: () => {
    const name = websiteConfig.metadata?.name ?? '';
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const title =
      currentLocale === 'zh'
        ? `Lang Study | 中文汉字书写与 HSK1 练习`
        : `Lang Study | Chinese Character Writing Practice`;
    const description =
      currentLocale === 'zh'
        ? '用 Lang Study 练习中文汉字、笔顺动画、跟随描写和可打印 HSK1 练习纸。'
        : 'Practice Chinese characters with stroke-order animation, guided tracing, HSK1 lessons, and printable handwriting worksheets.';
    const inLanguage = localeConfig[getLocale()].hreflang;
    const metadata = seo('/', { title, description });
    return {
      ...metadata,
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            websiteJsonLd({ description, inLanguage, name, path: '/' }),
          ])
        ),
      ],
    };
  },
  component: HanziPracticePage,
});
