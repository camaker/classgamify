import { getActivityTemplates } from '@/activities/catalog';
import type {
  ActivityTemplateContentRequirement,
  ActivityTemplateType,
} from '@/activities/types';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { TEMPLATE_GUIDE_PATHS } from '@/pages/template-guide-content';

export type HomeGuideStepId = 'publish' | 'results' | 'template';

export type HomeGuideTemplateLink = {
  description: string;
  /** English template guide; other locales link to the template directory. */
  guideHref: string | null;
  name: string;
  type: ActivityTemplateType;
};

export type HomeGuideFaq = {
  answer: string;
  question: string;
};

type HomeGuideMoreLink = {
  label: string;
  to:
    | typeof Routes.Blog
    | typeof Routes.Pricing
    | typeof Routes.Teachers
    | typeof Routes.Worksheets;
};

export type HomeGuideView = {
  examples: {
    allLabel: string;
    description: string;
    eyebrow: string;
    templates: HomeGuideTemplateLink[];
    title: string;
  };
  faq: {
    eyebrow: string;
    items: HomeGuideFaq[];
    title: string;
  };
  more: {
    links: HomeGuideMoreLink[];
    title: string;
  };
  steps: {
    eyebrow: string;
    items: { description: string; id: HomeGuideStepId; title: string }[];
    title: string;
  };
};

/** Joins localized names with the locale's own list conjunction. */
export function formatLocalizedList(items: string[]) {
  const locale = localeConfig[getLocale()].hreflang;
  try {
    return new Intl.ListFormat(locale, {
      style: 'long',
      type: 'conjunction',
    }).format(items);
  } catch {
    return items.join(', ');
  }
}

export function getTemplateNamesByRequirement(
  requirement: ActivityTemplateContentRequirement
) {
  return formatLocalizedList(
    getActivityTemplates()
      .filter((template) => template.contentRequirements.includes(requirement))
      .map((template) => template.name)
  );
}

export function buildHomeGuideView(): HomeGuideView {
  const isEnglish = getLocale() === 'en';
  const templates = getActivityTemplates();

  return {
    steps: {
      eyebrow: m.home_guide_steps_eyebrow(),
      title: m.home_guide_steps_title(),
      items: [
        {
          id: 'template',
          title: m.home_guide_steps_1_title(),
          description: m.home_guide_steps_1_description(),
        },
        {
          id: 'publish',
          title: m.home_guide_steps_2_title(),
          description: m.home_guide_steps_2_description(),
        },
        {
          id: 'results',
          title: m.home_guide_steps_3_title(),
          description: m.home_guide_steps_3_description(),
        },
      ],
    },
    examples: {
      eyebrow: m.home_guide_examples_eyebrow(),
      title: m.home_guide_examples_title(),
      description: m.home_guide_examples_description(),
      allLabel: m.home_guide_examples_all(),
      templates: templates.map((template) => ({
        description: template.description,
        guideHref: isEnglish ? TEMPLATE_GUIDE_PATHS[template.type] : null,
        name: template.name,
        type: template.type,
      })),
    },
    faq: {
      eyebrow: m.home_guide_faq_eyebrow(),
      title: m.home_guide_faq_title(),
      items: [
        {
          question: m.home_guide_faq_1_question(),
          answer: m.home_guide_faq_1_answer(),
        },
        {
          question: m.home_guide_faq_2_question(),
          answer: m.home_guide_faq_2_answer(),
        },
        {
          question: m.home_guide_faq_3_question(),
          answer: m.home_guide_faq_3_answer({
            templates: formatLocalizedList(
              templates.map((template) => template.name)
            ),
          }),
        },
        {
          question: m.home_guide_faq_4_question(),
          answer: m.home_guide_faq_4_answer(),
        },
        {
          question: m.home_guide_faq_5_question(),
          answer: m.home_guide_faq_5_answer(),
        },
        {
          question: m.home_guide_faq_6_question(),
          answer: m.home_guide_faq_6_answer(),
        },
      ],
    },
    more: {
      title: m.home_guide_more_title(),
      links: [
        { label: m.home_guide_more_teachers(), to: Routes.Teachers },
        { label: m.home_guide_more_worksheets(), to: Routes.Worksheets },
        { label: m.home_guide_more_blog(), to: Routes.Blog },
        { label: m.home_guide_more_pricing(), to: Routes.Pricing },
      ],
    },
  };
}
