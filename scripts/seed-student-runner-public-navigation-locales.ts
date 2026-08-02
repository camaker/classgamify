import { readFile, writeFile } from 'node:fs/promises';

const keys = [
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

const translations: Record<string, string[]> = {
  fr: [
    'Devoirs',
    'Tableau de bord',
    'Résultats du devoir',
    'Parcourir les modèles',
    'Créer une activité',
    'Espace élève public',
    'Ouvrez une activité élève publique à partir du devoir partagé par un enseignant.',
    'Activité élève',
    'Espace de travail de l’élève',
  ],
  de: [
    'Aufgaben',
    'Übersicht',
    'Aufgabenergebnisse',
    'Vorlagen durchsuchen',
    'Aktivität erstellen',
    'Öffentlicher Schülerbereich',
    'Öffne eine öffentliche Schüleraktivität über die von der Lehrkraft geteilte Aufgabe.',
    'Schüleraktivität',
    'Arbeitsbereich für Schüler',
  ],
  ja: [
    '課題',
    'ダッシュボード',
    '課題の結果',
    'テンプレートを見る',
    'アクティビティを作成',
    '生徒向け公開ページ',
    '先生が共有した課題から、生徒向けの公開アクティビティを開きます。',
    '生徒用アクティビティ',
    '生徒の解答エリア',
  ],
  ko: [
    '과제',
    '대시보드',
    '과제 결과',
    '템플릿 둘러보기',
    '활동 만들기',
    '학생 공개 페이지',
    '교사가 공유한 과제에서 학생용 공개 활동을 엽니다.',
    '학생 활동',
    '학생 활동 영역',
  ],
  it: [
    'Compiti',
    'Pannello',
    'Risultati del compito',
    'Sfoglia i modelli',
    'Crea un’attività',
    'Pagina pubblica per studenti',
    'Apri un’attività pubblica per studenti dal compito condiviso dall’insegnante.',
    'Attività per studenti',
    'Area di lavoro dello studente',
  ],
  es: [
    'Tareas',
    'Panel',
    'Resultados de la tarea',
    'Explorar plantillas',
    'Crear una actividad',
    'Página pública para estudiantes',
    'Abre una actividad pública para estudiantes desde la tarea compartida por el docente.',
    'Actividad para estudiantes',
    'Área de trabajo del estudiante',
  ],
  'pt-BR': [
    'Tarefas',
    'Painel',
    'Resultados da tarefa',
    'Explorar modelos',
    'Criar uma atividade',
    'Página pública do aluno',
    'Abra uma atividade pública para alunos pela tarefa compartilhada pelo professor.',
    'Atividade do aluno',
    'Área de atividade do aluno',
  ],
  ar: [
    'الواجبات',
    'لوحة التحكم',
    'نتائج الواجب',
    'تصفح القوالب',
    'إنشاء نشاط',
    'صفحة الطالب العامة',
    'افتح نشاطاً عاماً للطلاب من الواجب الذي شاركه المعلم.',
    'نشاط الطالب',
    'مساحة عمل الطالب',
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

console.log('Localized student public navigation for eight locales.');
