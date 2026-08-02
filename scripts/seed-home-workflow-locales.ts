import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    home_features2_description:
      'Conçu pour des bibliothèques d’activités réutilisables, le suivi des devoirs, l’entraînement sur fiches et la revue des résultats.',
    home_features2_feature1: 'Remix de modèles',
    home_features2_feature2: 'Réglages des devoirs',
    home_features2_feature3: 'Parcours élèves',
    home_features2_feature4: 'Synthèses des résultats',
    home_features2_subtitle: 'Pensé pour les activités de classe',
    home_features2_title: 'Flux de travail',
    home_integration2_description:
      'Reliez la création d’activités, les liens de devoirs, les modes fiche et la revue des résultats dans une routine répétable.',
    home_integration2_primary_button: 'Créer une activité',
    home_integration2_secondary_button: 'Voir les formules',
    home_integration2_title:
      'Réunir la pratique de classe dans une seule boucle',
    home_stats_description:
      'Une surface de lancement ciblée pour vérifier la boucle activité-devoirs-résultats avant d’ajouter d’autres modèles.',
    home_stats_subtitle: 'Conçu pour des classes régulières',
    home_stats_title: 'Rythme de classe',
  },
  de: {
    home_features2_description:
      'Für wiederverwendbare Aktivitätsbibliotheken, Aufgabenübergabe, Arbeitsblatt-Übungen und Ergebnisprüfung.',
    home_features2_feature1: 'Vorlagen-Remixe',
    home_features2_feature2: 'Aufgabeneinstellungen',
    home_features2_feature3: 'Schülerläufe',
    home_features2_feature4: 'Ergebnisübersichten',
    home_features2_subtitle: 'Für Klassenaktivitäten entwickelt',
    home_features2_title: 'Arbeitsablauf',
    home_integration2_description:
      'Aktivitätserstellung, Aufgabenlinks, Arbeitsblattmodi und Ergebnisprüfung in einer wiederholbaren Routine verbinden.',
    home_integration2_primary_button: 'Aktivität erstellen',
    home_integration2_secondary_button: 'Tarife ansehen',
    home_integration2_title: 'Klassenübungen in einer Schleife verbinden',
    home_stats_description:
      'Eine fokussierte Startfläche, um den Ablauf von Aktivität über Aufgabe bis Ergebnis zu prüfen, bevor weitere Vorlagen hinzukommen.',
    home_stats_subtitle: 'Für wiederholbare Klassenabläufe',
    home_stats_title: 'Klassenrhythmus',
  },
  ja: {
    home_features2_description:
      '再利用できるアクティビティ集、宿題の引き継ぎ、ワークシート型の練習、結果の確認に対応します。',
    home_features2_feature1: 'テンプレートのアレンジ',
    home_features2_feature2: '課題設定',
    home_features2_feature3: '生徒用ランナー',
    home_features2_feature4: '結果のまとめ',
    home_features2_subtitle: '授業アクティビティのために設計',
    home_features2_title: 'ワークフロー',
    home_integration2_description:
      'アクティビティ作成、課題リンク、ワークシートモード、結果確認を繰り返せる一つの流れにまとめます。',
    home_integration2_primary_button: 'アクティビティを作成',
    home_integration2_secondary_button: 'プランを見る',
    home_integration2_title: '授業の練習を一つのループにまとめる',
    home_stats_description:
      'テンプレートを増やす前に、アクティビティから課題、結果までの流れを確かめるための集中した入口です。',
    home_stats_subtitle: '繰り返し使える授業のために',
    home_stats_title: '授業のリズム',
  },
  ko: {
    home_features2_description:
      '재사용 가능한 활동 라이브러리, 과제 전달, 워크시트형 연습, 결과 검토를 위해 만들어졌습니다.',
    home_features2_feature1: '템플릿 리믹스',
    home_features2_feature2: '과제 설정',
    home_features2_feature3: '학생 러너',
    home_features2_feature4: '결과 요약',
    home_features2_subtitle: '교실 활동을 위해 설계',
    home_features2_title: '워크플로',
    home_integration2_description:
      '활동 만들기, 과제 링크, 워크시트 모드, 결과 검토를 반복 가능한 하나의 루틴으로 연결합니다.',
    home_integration2_primary_button: '활동 만들기',
    home_integration2_secondary_button: '요금제 보기',
    home_integration2_title: '교실 연습을 하나의 루프로 연결',
    home_stats_description:
      '템플릿을 더하기 전에 활동에서 과제, 결과로 이어지는 흐름을 확인하는 집중된 시작 화면입니다.',
    home_stats_subtitle: '반복 가능한 수업을 위해',
    home_stats_title: '교실 리듬',
  },
  it: {
    home_features2_description:
      'Pensato per librerie di attività riutilizzabili, consegna dei compiti, pratica in stile scheda e revisione dei risultati.',
    home_features2_feature1: 'Remix dei modelli',
    home_features2_feature2: 'Impostazioni dei compiti',
    home_features2_feature3: 'Percorsi studente',
    home_features2_feature4: 'Riepiloghi dei risultati',
    home_features2_subtitle: 'Progettato per le attività in classe',
    home_features2_title: 'Flusso di lavoro',
    home_integration2_description:
      'Collega creazione delle attività, link dei compiti, modalità scheda e revisione dei risultati in una routine ripetibile.',
    home_integration2_primary_button: 'Crea attività',
    home_integration2_secondary_button: 'Vedi i piani',
    home_integration2_title: 'Porta la pratica in classe in un unico ciclo',
    home_stats_description:
      'Una pagina di lancio mirata per verificare il ciclo attività-compito-risultati prima di aggiungere altri modelli.',
    home_stats_subtitle: 'Per classi con una routine',
    home_stats_title: 'Ritmo della classe',
  },
  es: {
    home_features2_description:
      'Creado para bibliotecas de actividades reutilizables, entrega de tareas, práctica tipo ficha y revisión de resultados.',
    home_features2_feature1: 'Remixes de plantillas',
    home_features2_feature2: 'Configuración de tareas',
    home_features2_feature3: 'Recorridos del estudiante',
    home_features2_feature4: 'Resúmenes de resultados',
    home_features2_subtitle: 'Diseñado para actividades de clase',
    home_features2_title: 'Flujo de trabajo',
    home_integration2_description:
      'Conecta la creación de actividades, los enlaces de tareas, los modos de ficha y la revisión de resultados en una rutina repetible.',
    home_integration2_primary_button: 'Crear actividad',
    home_integration2_secondary_button: 'Ver planes',
    home_integration2_title: 'Reunir la práctica de clase en un solo ciclo',
    home_stats_description:
      'Una entrada enfocada para probar el ciclo actividad-tarea-resultados antes de añadir más plantillas.',
    home_stats_subtitle: 'Para clases repetibles',
    home_stats_title: 'Ritmo de clase',
  },
  'pt-BR': {
    home_features2_description:
      'Feito para bibliotecas de atividades reutilizáveis, entrega de tarefas, prática no estilo de ficha e revisão de resultados.',
    home_features2_feature1: 'Remixes de modelos',
    home_features2_feature2: 'Configurações de tarefas',
    home_features2_feature3: 'Percursos do aluno',
    home_features2_feature4: 'Resumos de resultados',
    home_features2_subtitle: 'Criado para atividades em sala',
    home_features2_title: 'Fluxo de trabalho',
    home_integration2_description:
      'Conecte criação de atividades, links de tarefas, modos de ficha e revisão de resultados em uma rotina repetível.',
    home_integration2_primary_button: 'Criar atividade',
    home_integration2_secondary_button: 'Ver planos',
    home_integration2_title: 'Levar a prática em sala para um único ciclo',
    home_stats_description:
      'Uma entrada focada para provar o ciclo atividade-tarefa-resultados antes de adicionar mais modelos.',
    home_stats_subtitle: 'Feito para aulas repetíveis',
    home_stats_title: 'Ritmo da sala',
  },
  ar: {
    home_features2_description:
      'مصمم لمكتبات الأنشطة القابلة لإعادة الاستخدام، وتسليم الواجبات، والتدريب بأسلوب أوراق العمل، ومراجعة النتائج.',
    home_features2_feature1: 'إعادة مزج القوالب',
    home_features2_feature2: 'إعدادات الواجب',
    home_features2_feature3: 'مسارات الطلاب',
    home_features2_feature4: 'ملخصات النتائج',
    home_features2_subtitle: 'مصمم لأنشطة الصف',
    home_features2_title: 'سير العمل',
    home_integration2_description:
      'اربط إنشاء الأنشطة وروابط الواجبات وأنماط أوراق العمل ومراجعة النتائج في روتين واحد قابل للتكرار.',
    home_integration2_primary_button: 'أنشئ نشاطا',
    home_integration2_secondary_button: 'اعرض الخطط',
    home_integration2_title: 'اجمع تدريب الصف في حلقة واحدة',
    home_stats_description:
      'واجهة إطلاق مركزة لإثبات حلقة النشاط والواجب والنتائج قبل إضافة مزيد من القوالب.',
    home_stats_subtitle: 'مصمم للحصص القابلة للتكرار',
    home_stats_title: 'إيقاع الصف',
  },
};

for (const locale of Object.keys(copy)) {
  const path = 'project.inlang/messages/' + locale + '.json';
  const messages = JSON.parse(await readFile(path, 'utf8')) as Record<
    string,
    string
  >;
  Object.assign(messages, copy[locale]);
  await writeFile(path, JSON.stringify(messages, null, 2) + '\n');
}

console.log('Seeded homepage workflow copy for 8 locales');
