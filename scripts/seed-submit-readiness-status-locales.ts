import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'student_runner_submit_readiness_status_blocked',
  'student_runner_submit_readiness_status_needs_action',
  'student_runner_submit_readiness_status_ready',
] as const;
const translations: Record<string, [string, string, string]> = {
  fr: ['Indisponible', 'À vérifier', 'Prêt'],
  de: ['Nicht verfügbar', 'Zu prüfen', 'Bereit'],
  ja: ['利用できません', '確認が必要', '準備完了'],
  ko: ['사용 불가', '검토 필요', '준비 완료'],
  it: ['Non disponibile', 'Da verificare', 'Pronto'],
  es: ['No disponible', 'Requiere revisión', 'Listo'],
  'pt-BR': ['Indisponível', 'Requer revisão', 'Pronto'],
  ar: ['غير متاح', 'يحتاج إلى مراجعة', 'جاهز'],
};

for (const [locale, values] of Object.entries(translations)) {
  const path = `project.inlang/messages/${locale}.json`;
  const messages = JSON.parse(await readFile(path, 'utf8')) as Record<
    string,
    string
  >;
  keys.forEach((key, index) => {
    messages[key] = values[index];
  });
  await writeFile(path, `${JSON.stringify(messages, null, 2)}\n`);
}

console.log(
  `Localized submit-readiness statuses for ${Object.keys(translations).length} locales.`
);
