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

const HOME_TRIAL_CHARACTERS = ['人', '口', '日'];

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
  component: HomePage,
});

function HomePage() {
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
  const introCopy =
    currentLocale === 'zh'
      ? {
          badge: '三字试用',
          description:
            '先用人、口、日跑通一个短练习：看笔顺、跟随描写、记录错笔，再打印同一组样张。',
          freeBadge: '3 个入门汉字',
          title: '从三个高频汉字开始练习',
          worksheetNote:
            '首页试用：先在线描写人、口、日，再打印同一组做纸面慢写。',
        }
      : {
          badge: 'Three-character trial',
          description:
            'Start with 人, 口, and 日: watch stroke order, trace once, save missed strokes, then print the same sample set.',
          freeBadge: '3 starter characters',
          title: 'Start with three high-frequency characters',
          worksheetNote:
            'Homepage trial: trace 人, 口, and 日 online first, then print the same set for slow handwriting.',
        };

  return (
    <HanziPracticePage
      initialCharacter={HOME_TRIAL_CHARACTERS[0]}
      initialCharacters={HOME_TRIAL_CHARACTERS}
      introCopy={introCopy}
    />
  );
}
