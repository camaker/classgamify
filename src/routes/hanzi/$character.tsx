import { HanziDetailPage } from '@/components/learn/hanzi-detail-page';
import { websiteConfig } from '@/config/website';
import { findHsk1Character, getHanziPath } from '@/learn/hanzi-course';
import { getLocale, localeConfig } from '@/lib/locale';
import { seo } from '@/lib/seo';
import { getCanonicalUrl } from '@/lib/urls';
import { createFileRoute, notFound, rootRouteId } from '@tanstack/react-router';
import { jsonLdScript } from '@/lib/structured-data';

export const Route = createFileRoute('/hanzi/$character')({
  loader: ({ params }) => {
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const character = findHsk1Character(params.character, currentLocale);

    if (!character) {
      throw notFound({ routeId: rootRouteId });
    }

    return character;
  },
  head: ({ loaderData }) => {
    const character = loaderData;
    if (!character) return {};

    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const path = getHanziPath(character.character);
    const title =
      currentLocale === 'zh'
        ? `${character.character} (${character.pinyin}) 怎么写 | ${websiteConfig.metadata?.name}`
        : `How to write ${character.character} (${character.pinyin}) | ${websiteConfig.metadata?.name}`;
    const description =
      currentLocale === 'zh'
        ? `学习 HSK1 汉字 ${character.character}：拼音 ${character.pinyin}，意思是 ${character.meaning}，共 ${character.strokes} 画，并配有例词和书写提示。`
        : `Learn the HSK1 character ${character.character}: pinyin ${character.pinyin}, meaning ${character.meaning}, ${character.strokes} strokes, example words, and a writing cue.`;
    const url = getCanonicalUrl(path);
    const learningJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: title,
      description,
      url,
      inLanguage: localeConfig[getLocale()].hreflang,
      educationalLevel: 'Beginner',
      teaches:
        currentLocale === 'zh'
          ? `${character.character} 的中文书写`
          : `Writing the Chinese character ${character.character}`,
      learningResourceType: 'Character card',
    };
    const metadata = seo(path, {
      title,
      description,
      keywords: `${character.character}, ${character.pinyin}, HSK1, Chinese character, Hanzi writing`,
    });

    return {
      ...metadata,
      scripts: [jsonLdScript(learningJsonLd)],
    };
  },
  component: HanziRoutePage,
});

function HanziRoutePage() {
  const character = Route.useLoaderData();
  return <HanziDetailPage character={character} />;
}
