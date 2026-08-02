import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'assignment_result_empty_attempt_review_description',
  'assignment_result_empty_attempt_review_title',
  'assignment_result_empty_search_answer_reviews_description',
  'assignment_result_empty_search_answer_reviews_title',
  'assignment_result_empty_needs_review_description',
  'assignment_result_empty_needs_review_title',
] as const;

const translations: Record<string, string[]> = {
  fr: [
    'Les travaux remis afficheront ici le détail des réponses, question par question.',
    'Aucune réponse à vérifier pour le moment.',
    "Effacez la recherche ou essayez le nom d'un autre élève de ce devoir.",
    'Aucune vérification de réponse correspondante.',
    'Toutes les réponses affichées sont actuellement correctes pour cette version du devoir.',
    'Aucune réponse ne nécessite de vérification.',
  ],
  de: [
    'Bei abgeschlossenen Abgaben erscheinen hier die Antworten zu den einzelnen Aufgaben.',
    'Noch keine Antworten zu prüfen.',
    'Suche löschen oder einen anderen Schülernamen aus dieser Aufgabe eingeben.',
    'Keine passenden Antwortprüfungen.',
    'Alle angezeigten Abgaben sind für diesen Aufgabenstand derzeit korrekt.',
    'Keine Antworten müssen geprüft werden.',
  ],
  ja: [
    '提出済みの解答があると、問題ごとの回答内容がここに表示されます。',
    '確認する回答はまだありません。',
    '検索を解除するか、この課題に参加している別の生徒名を入力してください。',
    '一致する回答確認はありません。',
    '表示中の提出内容は、この課題の現在の版ではすべて正解です。',
    '確認が必要な回答はありません。',
  ],
  ko: [
    '제출이 완료되면 문항별 답안 내용이 여기에 표시됩니다.',
    '아직 검토할 답안이 없습니다.',
    '검색을 지우거나 이 과제에 참여한 다른 학생 이름을 입력해 보세요.',
    '일치하는 답안 검토가 없습니다.',
    '현재 표시된 제출 답안은 이 과제 버전에서 모두 정답입니다.',
    '검토가 필요한 답안이 없습니다.',
  ],
  it: [
    'Le consegne completate mostreranno qui le risposte, domanda per domanda.',
    'Nessuna risposta da controllare per ora.',
    'Cancella la ricerca o prova il nome di un altro studente di questo compito.',
    'Nessuna verifica delle risposte corrispondente.',
    'Tutte le consegne visualizzate sono attualmente corrette per questa versione del compito.',
    'Nessuna risposta richiede una verifica.',
  ],
  es: [
    'Las entregas completadas mostrarán aquí las respuestas de cada pregunta.',
    'Todavía no hay respuestas que revisar.',
    'Borra la búsqueda o prueba con el nombre de otro estudiante de esta tarea.',
    'No hay revisiones de respuestas coincidentes.',
    'Todas las entregas mostradas son correctas para la versión actual de esta tarea.',
    'No hay respuestas que necesiten revisión.',
  ],
  'pt-BR': [
    'As respostas de cada questão aparecerão aqui quando a atividade for enviada.',
    'Ainda não há respostas para revisar.',
    'Limpe a busca ou tente o nome de outro aluno desta atividade.',
    'Nenhuma revisão de resposta correspondente.',
    'Todas as respostas exibidas estão corretas para esta versão da atividade.',
    'Nenhuma resposta precisa de revisão.',
  ],
  ar: [
    'ستظهر هنا تفاصيل الإجابات لكل سؤال بعد اكتمال الإرسال.',
    'لا توجد إجابات لمراجعتها بعد.',
    'امسح البحث أو جرّب اسم طالب آخر في هذا الواجب.',
    'لا توجد مراجعات إجابات مطابقة.',
    'جميع الإجابات المعروضة صحيحة حاليًا وفق هذه النسخة من الواجب.',
    'لا توجد إجابات تحتاج إلى مراجعة.',
  ],
};

for (const [locale, values] of Object.entries(translations)) {
  if (values.length !== keys.length)
    throw new Error(`${locale} value count mismatch`);
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
  `Localized answer-review empty states for ${Object.keys(translations).length} locales.`
);
