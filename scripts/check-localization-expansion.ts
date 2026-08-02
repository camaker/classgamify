import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

type Policy = {
  completeKeyPrefixes: string[];
  targetLocales: string[];
  draftLocales: string[];
  draftNamespaces: Record<string, string[]>;
  englishOnlyKeys: string[];
  englishOnlyKeyPatterns: string[];
  legalMarkdown: string[];
};

type InlangSettings = {
  baseLocale: string;
  locales: string[];
};

const policy = JSON.parse(
  await readFile('project.inlang/localization-policy.json', 'utf8')
) as Policy;
const settings = JSON.parse(
  await readFile('project.inlang/settings.json', 'utf8')
) as InlangSettings;
const english = JSON.parse(
  await readFile('project.inlang/messages/en.json', 'utf8')
) as Record<string, string>;
const requiredVisibleLocalizedPrefixes = [
  'activity_library_filter_source_',
  'activity_library_filter_status_',
  'activity_library_filter_template_',
  'assignment_result_empty_student_summary_',
  'assignment_result_empty_search_students_',
  'assignment_result_empty_attempt_rows_',
  'assignment_result_empty_search_attempts_',
  'assignment_result_empty_attempt_review_',
  'assignment_result_empty_search_answer_reviews_',
  'assignment_result_empty_needs_review_',
] as const;
const visibleLocaleNeutralKeys = new Set([
  'activity_library_filter_source_audio',
  'activity_library_filter_source_selected_description',
  'activity_library_filter_status_selected_description',
]);
const structuralLocaleNeutralKeys = new Set([
  'activity_editor_scaffold_review_item_aria_label',
  'activity_library_card_aria_label',
  'activity_library_filter_status_selected_description',
  'activity_library_stat_aria_label',
  'activity_library_status_metric_aria_label',
  'activity_library_summary_aria_label',
  'activity_library_template_list_separator',
  'activity_remix_title_format',
  'assignment_list_card_stat_aria_label',
  'assignment_list_distribution_aria_label',
  'assignment_list_distribution_step_aria_label',
  'assignment_list_search_status_description',
  'assignment_list_summary_metric_aria_label',
  'dashboard_overview_action_card_aria_label',
  'dashboard_overview_next_action_aria_label',
  'dashboard_overview_next_action_status_aria_label',
  'home_feature_aria_label',
  'home_feature_section_aria_label',
  'home_signal_aria_label',
  'home_signal_panel_aria_label',
  'teachers_page_card_aria_label',
  'teachers_page_template_panel_aria_label',
  'teachers_page_use_case_section_aria_label',
  'teachers_page_workflow_section_aria_label',
  'templates_page_card_aria_label',
  'templates_page_entry_step_aria_label',
  'worksheets_page_mode_card_aria_label',
  'worksheets_page_mode_signal_aria_label',
]);
const naturalSameValueKeys: Record<string, Set<string>> = {
  fr: new Set([
    'common_pagination',
    'common_table_page',
    'nav_blog',
    'footer_contact_short',
    'footer_link_articles',
    'footer_metric_result_value',
    'assignment_list_scope_page_label',
    'activity_library_scope_page_label',
    'activity_library_stat_questions',
    'activity_form_field_description',
    'activity_form_field_questions',
    'activity_preview_questions_title',
    'activity_template_quiz_name',
    'activity_template_quiz_short_name',
    'activity_template_requirement_questions',
  ]),
  de: new Set([
    'common_mode_system',
    'nav_blog',
    'footer_link_support',
    'footer_metric_assignment_value',
    'footer_section_support',
    'auth_register_name',
    'assignment_list_search_status_label',
    'assignment_list_page_breadcrumb_dashboard',
    'assignment_list_distribution_step_status_optional',
    'activity_template_open_box_short_name',
    'activity_template_quiz_name',
    'activity_template_quiz_short_name',
    'worksheets_page_mode_signal_editor_label',
  ]),
  ja: new Set(),
  ko: new Set(),
  it: new Set([
    'common_home',
    'nav_blog',
    'footer_metric_assignment_value',
    'auth_login_password',
    'auth_register_password',
    'dashboard_avatar_dashboard',
    'dashboard_overview_breadcrumb',
    'dashboard_sidebar_dashboard',
    'dashboard_title',
    'assignment_list_page_breadcrumb_dashboard',
    'activity_library_breadcrumb_dashboard',
    'activity_template_quiz_name',
    'activity_template_quiz_short_name',
    'worksheets_page_mode_signal_editor_label',
  ]),
  es: new Set([
    'nav_blog',
    'activity_template_classroom_mode_individual',
    'activity_template_quiz_short_name',
    'worksheets_page_mode_signal_editor_label',
  ]),
  'pt-BR': new Set([
    'nav_blog',
    'footer_metric_assignment_value',
    'assignment_list_search_status_label',
    'activity_template_classroom_mode_individual',
    'activity_template_quiz_name',
    'activity_template_quiz_short_name',
    'worksheets_page_mode_signal_editor_label',
  ]),
  ar: new Set(),
};
const requiredVisibleLocalizedKeys = [
  'activity_created_panel_loading_title',
  'activity_created_panel_loading_body',
  'activity_created_panel_missing_title',
  'activity_created_panel_missing_body',
  'activity_api_error_activity_not_found',
  'activity_api_error_create_load_failed',
  'activity_api_error_duplicate_load_failed',
  'activity_api_error_remix_load_failed',
  'activity_api_error_remix_same_template',
  'activity_api_error_template_not_found',
  'activity_api_error_write_conflict',
  'student_runner_feedback_status_correct',
  'student_runner_feedback_status_needs_review',
  'student_runner_feedback_status_unanswered',
  'student_runner_submit_readiness_status_blocked',
  'student_runner_submit_readiness_status_needs_action',
  'student_runner_submit_readiness_status_ready',
  'student_runner_loading',
  'student_runner_prepare_title',
  'student_runner_progress_description',
  'student_runner_result_region_label',
  'student_runner_status_bar_label',
  'student_runner_time_expired_notice_label',
  'student_runner_timer_active_description',
  'student_runner_sequential_default_item_label',
  'assignment_result_page_breadcrumb_assignments',
  'assignment_result_page_breadcrumb_dashboard',
  'assignment_result_page_default_title',
  'student_runner_browse_templates',
  'student_runner_create_activity',
  'student_runner_public_route_badge',
  'student_runner_seo_description',
  'student_runner_seo_title_prefix',
  'student_runner_attempt_region_label',
] as const;

assert.deepEqual(policy.targetLocales, [
  'en',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'it',
  'es',
  'pt-BR',
  'ar',
]);
assert.deepEqual(policy.draftLocales, policy.targetLocales.slice(2));
assert.equal(settings.baseLocale, 'en');
assert.ok(
  settings.locales.every((locale) => policy.targetLocales.includes(locale)),
  'Enabled locales must be a subset of the ten-language target.'
);
assert.ok(!policy.targetLocales.includes('zh-TW'));
assert.ok(!policy.targetLocales.includes('zh-Hant'));

for (const locale of policy.draftLocales) {
  const messages = JSON.parse(
    await readFile(`project.inlang/messages/${locale}.json`, 'utf8')
  ) as Record<string, string>;
  for (const prefix of requiredVisibleLocalizedPrefixes) {
    const keys = Object.keys(english).filter((key) => key.startsWith(prefix));
    assert.ok(keys.length, `Unknown visible localized prefix: ${prefix}`);
    for (const key of keys) {
      if (visibleLocaleNeutralKeys.has(key)) continue;
      assert.notEqual(
        messages[key],
        english[key],
        `${locale}.${key} must be localized as visible activity-library copy`
      );
    }
  }
  for (const key of requiredVisibleLocalizedKeys) {
    assert.notEqual(
      messages[key],
      english[key],
      `${locale}.${key} must be localized as visible product copy`
    );
  }
}

const legalFiles = (await readdir('content/pages'))
  .filter((file) => /^(cookie|privacy|terms)(\..+)?\.md$/.test(file))
  .sort();
assert.deepEqual(legalFiles, policy.legalMarkdown);

function placeholders(value: string) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort();
}

const englishOnlyPatterns = policy.englishOnlyKeyPatterns.map(
  (pattern) => new RegExp(pattern, 'i')
);
const englishOnlyKeys = new Set(policy.englishOnlyKeys);
assert.equal(
  englishOnlyKeys.size,
  policy.englishOnlyKeys.length,
  'English-only message keys must be unique.'
);
for (const key of englishOnlyKeys) {
  assert.ok(key in english, `Unknown English-only message key: ${key}`);
}

function isEnglishOnly(key: string) {
  return (
    englishOnlyKeys.has(key) ||
    englishOnlyPatterns.some((pattern) => pattern.test(key))
  );
}

const completeKeys = new Set(
  policy.completeKeyPrefixes.flatMap((prefix) =>
    Object.keys(english).filter((key) => key.startsWith(prefix))
  )
);
for (const locale of policy.draftLocales) {
  const messages = JSON.parse(
    await readFile(`project.inlang/messages/${locale}.json`, 'utf8')
  ) as Record<string, string>;
  for (const key of completeKeys) {
    if (
      isEnglishOnly(key) ||
      structuralLocaleNeutralKeys.has(key) ||
      naturalSameValueKeys[locale]?.has(key) ||
      english[key] === 'ClassGamify'
    ) {
      continue;
    }
    assert.notEqual(
      messages[key],
      english[key],
      `${locale}.${key} must not fall back to English ordinary copy`
    );
  }
}

const draftKeyCounts = new Map<string, number>();
for (const keys of Object.values(policy.draftNamespaces)) {
  for (const key of keys) {
    draftKeyCounts.set(key, (draftKeyCounts.get(key) ?? 0) + 1);
  }
}
for (const prefix of policy.completeKeyPrefixes) {
  const sourceKeys = Object.keys(english).filter((key) =>
    key.startsWith(prefix)
  );
  assert.ok(sourceKeys.length, `Unknown complete key prefix: ${prefix}`);
  for (const key of sourceKeys) {
    const draftCount = draftKeyCounts.get(key) ?? 0;
    assert.ok(draftCount <= 1, `${key} appears in multiple draft namespaces`);
    assert.ok(
      draftCount === 1 || isEnglishOnly(key),
      `${key} is neither localized nor explicitly English-only`
    );
  }
}
const draftsRoot = 'project.inlang/drafts';

try {
  if ((await stat(draftsRoot)).isDirectory()) {
    for (const locale of await readdir(draftsRoot)) {
      assert.ok(
        policy.draftLocales.includes(locale),
        `Unexpected draft locale directory: ${locale}`
      );
      for (const file of await readdir(path.join(draftsRoot, locale))) {
        assert.match(file, /^[a-z0-9-]+\.json$/);
        const namespace = file.slice(0, -'.json'.length);
        const draft = JSON.parse(
          await readFile(path.join(draftsRoot, locale, file), 'utf8')
        ) as Record<string, string>;
        const expectedKeys = (
          policy.draftNamespaces[namespace] ??
          Object.keys(english).filter((key) => key.startsWith(`${namespace}_`))
        ).sort();
        assert.ok(expectedKeys.length, `Unknown draft namespace: ${namespace}`);
        assert.deepEqual(Object.keys(draft).sort(), expectedKeys);
        const localizableKeys = expectedKeys.filter(
          (key) => !isEnglishOnly(key) && english[key] !== 'ClassGamify'
        );
        for (const key of expectedKeys) {
          assert.ok(draft[key].trim(), `${locale}/${file}:${key} is empty`);
          assert.deepEqual(
            placeholders(draft[key]),
            placeholders(english[key]),
            `${locale}/${file}:${key} placeholders differ`
          );
          if (isEnglishOnly(key)) {
            assert.equal(
              draft[key],
              english[key],
              `${locale}/${file}:${key} must remain English`
            );
          }
        }
        const localizedCount = localizableKeys.filter(
          (key) => draft[key] !== english[key]
        ).length;
        assert.ok(
          localizedCount >= Math.ceil(localizableKeys.length / 2),
          `${locale}/${file} must localize most non-sensitive messages`
        );
        const localizedText = localizableKeys
          .map((key) => draft[key])
          .join('\n');
        if (locale === 'ja') assert.match(localizedText, /[\u3040-\u30ff]/);
        if (locale === 'ko') assert.match(localizedText, /[\uac00-\ud7af]/);
        if (locale === 'ar') assert.match(localizedText, /[\u0600-\u06ff]/);
      }
    }
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

console.log(
  `Localization expansion contract OK (${policy.targetLocales.length} target locales, ${policy.draftLocales.length} draft locales, ${policy.completeKeyPrefixes.length} complete page prefixes, English-only legal Markdown, ${policy.englishOnlyKeys.length} explicit English-only keys, and ${policy.englishOnlyKeyPatterns.length} sensitive key patterns)`
);
