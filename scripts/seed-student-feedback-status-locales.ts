import { readFile, writeFile } from 'node:fs/promises';

const translations: Record<string, [string, string, string]> = {
  fr: ['Réponse correcte', 'À vérifier', 'Sans réponse'],
  de: ['Richtig', 'Zu prüfen', 'Nicht beantwortet'],
  ja: ['正解', '確認が必要', '未回答'],
  ko: ['정답', '검토 필요', '미응답'],
  it: ['Corretto', 'Da verificare', 'Senza risposta'],
  es: ['Correcto', 'Requiere revisión', 'Sin respuesta'],
  'pt-BR': ['Correto', 'Requer revisão', 'Sem resposta'],
  ar: ['صحيح', 'يحتاج إلى مراجعة', 'من دون إجابة'],
};
const keys = [
  'student_runner_feedback_status_correct',
  'student_runner_feedback_status_needs_review',
  'student_runner_feedback_status_unanswered',
] as const;

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
  `Localized student feedback statuses for ${Object.keys(translations).length} locales.`
);
