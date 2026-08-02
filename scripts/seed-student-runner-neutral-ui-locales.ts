import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'student_runner_loading',
  'student_runner_prepare_title',
  'student_runner_progress_description',
  'student_runner_result_region_label',
  'student_runner_status_bar_label',
  'student_runner_time_expired_notice_label',
  'student_runner_timer_active_description',
  'student_runner_sequential_default_item_label',
] as const;

const translations: Record<string, string[]> = {
  fr: [
    "Chargement de l'activité...",
    'Avant de commencer',
    'Progression actuelle : {progress}.',
    'Résultat de la tentative envoyée',
    'État de la tentative',
    'Avis de fin du temps imparti',
    "Le compte à rebours visible démarre une fois l'activité chargée.",
    'Question',
  ],
  de: [
    'Aktivität wird geladen...',
    'Bevor du beginnst',
    'Aktueller Fortschritt: {progress}.',
    'Ergebnis des abgegebenen Versuchs',
    'Versuchsstatus',
    'Hinweis zum Zeitablauf',
    'Der sichtbare Countdown beginnt erst, wenn die Aktivität geladen ist.',
    'Aufgabe',
  ],
  ja: [
    'アクティビティを読み込んでいます...',
    '始める前に',
    '現在の進捗：{progress}。',
    '提出した解答の結果',
    '解答状況',
    '制限時間終了のお知らせ',
    '画面のタイマーは、アクティビティの読み込み後にカウントダウンを開始します。',
    '問題',
  ],
  ko: [
    '활동을 불러오는 중...',
    '시작하기 전에',
    '현재 진행률: {progress}.',
    '제출한 시도의 결과',
    '시도 상태',
    '제한 시간 종료 알림',
    '화면의 타이머는 활동을 모두 불러온 뒤부터 줄어듭니다.',
    '문항',
  ],
  it: [
    "Caricamento dell'attività...",
    'Prima di iniziare',
    'Avanzamento attuale: {progress}.',
    'Risultato del tentativo inviato',
    'Stato del tentativo',
    'Avviso di tempo scaduto',
    "Il conto alla rovescia visibile inizia dopo il caricamento dell'attività.",
    'Domanda',
  ],
  es: [
    'Cargando la actividad...',
    'Antes de empezar',
    'Progreso actual: {progress}.',
    'Resultado del intento enviado',
    'Estado del intento',
    'Aviso de tiempo agotado',
    'La cuenta atrás visible empieza cuando la actividad termina de cargarse.',
    'Pregunta',
  ],
  'pt-BR': [
    'Carregando a atividade...',
    'Antes de começar',
    'Progresso atual: {progress}.',
    'Resultado da tentativa enviada',
    'Status da tentativa',
    'Aviso de tempo esgotado',
    'A contagem regressiva visível começa depois que a atividade é carregada.',
    'Questão',
  ],
  ar: [
    'جارٍ تحميل النشاط...',
    'قبل أن تبدأ',
    'التقدم الحالي: {progress}.',
    'نتيجة المحاولة المرسلة',
    'حالة المحاولة',
    'تنبيه انتهاء الوقت',
    'يبدأ العد التنازلي الظاهر بعد اكتمال تحميل النشاط.',
    'السؤال',
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

console.log('Localized neutral student-runner UI for eight locales.');
