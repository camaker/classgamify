import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'assignment_result_empty_student_summary_description',
  'assignment_result_empty_student_summary_title',
  'assignment_result_empty_search_students_description',
  'assignment_result_empty_search_students_title',
  'assignment_result_empty_attempt_rows_description',
  'assignment_result_empty_attempt_rows_title',
  'assignment_result_empty_search_attempts_description',
  'assignment_result_empty_search_attempts_title',
] as const;

const translations: Record<string, string[]> = {
  fr: [
    "Les synthèses des élèves apparaîtront dès qu'une première tentative aura été envoyée.",
    "Aucune synthèse d'élève pour le moment.",
    "Effacez la recherche ou essayez le nom d'un autre élève de ce devoir.",
    'Aucun élève correspondant.',
    'Partagez le lien élève ; les travaux remis apparaîtront ensuite ici.',
    "Aucune tentative d'élève pour le moment.",
    "Effacez la recherche ou essayez le nom d'un autre élève de ce devoir.",
    'Aucune tentative correspondante.',
  ],
  de: [
    'Schülerübersichten erscheinen, sobald mindestens ein Versuch abgegeben wurde.',
    'Noch keine Schülerübersichten.',
    'Suche löschen oder einen anderen Schülernamen aus dieser Aufgabe eingeben.',
    'Keine passenden Schülerinnen oder Schüler.',
    'Teilen Sie den Schülerlink. Abgeschlossene Abgaben erscheinen anschließend hier.',
    'Noch keine Schülerversuche.',
    'Suche löschen oder einen anderen Schülernamen aus dieser Aufgabe eingeben.',
    'Keine passenden Versuche.',
  ],
  ja: [
    '提出済みの解答が1件以上あると、生徒ごとの概要が表示されます。',
    '生徒の概要はまだありません。',
    '検索を解除するか、この課題に参加している別の生徒名を入力してください。',
    '一致する生徒はいません。',
    '生徒用リンクを共有すると、提出済みの解答がここに表示されます。',
    '生徒の解答はまだありません。',
    '検索を解除するか、この課題に参加している別の生徒名を入力してください。',
    '一致する解答はありません。',
  ],
  ko: [
    '한 명 이상이 답안을 제출하면 학생별 요약이 표시됩니다.',
    '아직 학생 요약이 없습니다.',
    '검색을 지우거나 이 과제에 참여한 다른 학생 이름을 입력해 보세요.',
    '일치하는 학생이 없습니다.',
    '학생용 링크를 공유하면 제출을 마친 답안이 여기에 표시됩니다.',
    '아직 학생 답안이 없습니다.',
    '검색을 지우거나 이 과제에 참여한 다른 학생 이름을 입력해 보세요.',
    '일치하는 답안이 없습니다.',
  ],
  it: [
    'I riepiloghi degli studenti compariranno dopo la prima consegna.',
    'Nessun riepilogo degli studenti per ora.',
    'Cancella la ricerca o prova il nome di un altro studente di questo compito.',
    'Nessuno studente corrispondente.',
    'Condividi il link per gli studenti: le consegne completate compariranno qui.',
    'Nessun tentativo degli studenti per ora.',
    'Cancella la ricerca o prova il nome di un altro studente di questo compito.',
    'Nessun tentativo corrispondente.',
  ],
  es: [
    'Los resúmenes del alumnado aparecerán cuando se haya enviado al menos un intento.',
    'Todavía no hay resúmenes del alumnado.',
    'Borra la búsqueda o prueba con el nombre de otro estudiante de esta tarea.',
    'No hay estudiantes coincidentes.',
    'Comparte el enlace del alumnado; las entregas completadas aparecerán aquí.',
    'Todavía no hay intentos del alumnado.',
    'Borra la búsqueda o prueba con el nombre de otro estudiante de esta tarea.',
    'No hay intentos coincidentes.',
  ],
  'pt-BR': [
    'Os resumos dos alunos aparecerão depois que pelo menos uma tentativa for enviada.',
    'Ainda não há resumos de alunos.',
    'Limpe a busca ou tente o nome de outro aluno desta atividade.',
    'Nenhum aluno correspondente.',
    'Compartilhe o link dos alunos; as respostas concluídas aparecerão aqui.',
    'Ainda não há tentativas dos alunos.',
    'Limpe a busca ou tente o nome de outro aluno desta atividade.',
    'Nenhuma tentativa correspondente.',
  ],
  ar: [
    'ستظهر ملخصات الطلاب بعد إرسال محاولة واحدة على الأقل.',
    'لا توجد ملخصات للطلاب بعد.',
    'امسح البحث أو جرّب اسم طالب آخر في هذا الواجب.',
    'لا يوجد طلاب مطابقون.',
    'شارك رابط الطلاب، وستظهر هنا الإجابات المكتملة بعد إرسالها.',
    'لا توجد محاولات للطلاب بعد.',
    'امسح البحث أو جرّب اسم طالب آخر في هذا الواجب.',
    'لا توجد محاولات مطابقة.',
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
  `Localized assignment-result empty states for ${Object.keys(translations).length} locales.`
);
