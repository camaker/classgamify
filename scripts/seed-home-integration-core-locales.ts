import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    home_integration_description:
      'Utilisez ClassGamify avec les outils que les enseignants emploient déjà pour distribuer le travail et suivre les progrès.',
    home_integration_subtitle: 'Fonctionne avec de vraies classes',
    home_integration_title: 'Flux de travail en classe',
    home_integration_items_item_1_description:
      'Partagez un lien élève ciblé avant le cours, le tutorat, les devoirs ou la séance de révision.',
    home_integration_items_item_1_title: 'Liens élèves',
    home_integration_items_item_2_description:
      'Créez des modes de fiche pour les textes à compléter, les associations de lignes, l’écoute et le classement par glisser-déposer.',
    home_integration_items_item_2_title: 'Modes fiche',
    home_integration_items_item_3_description:
      'Gardez les consignes, les règles de remise et les exports de résultats liés au même instantané figé.',
    home_integration_items_item_3_title: 'Dossiers de devoirs',
    home_integration_learn_more: 'En savoir plus',
  },
  de: {
    home_integration_description:
      'Nutzen Sie ClassGamify zusammen mit den Werkzeugen, die Lehrkräfte bereits zum Austeilen von Aufgaben und Prüfen des Fortschritts verwenden.',
    home_integration_subtitle: 'Funktioniert mit echten Klassen',
    home_integration_title: 'Arbeitsablauf im Unterricht',
    home_integration_items_item_1_description:
      'Teilen Sie vor Unterricht, Nachhilfe, Hausaufgaben oder Wiederholung einen fokussierten Schülerlink.',
    home_integration_items_item_1_title: 'Schülerlinks',
    home_integration_items_item_2_description:
      'Erstellen Sie Arbeitsblattmodi für Lückentexte, Zeilenpaare, Hörübungen und Sortieren per Drag-and-drop.',
    home_integration_items_item_2_title: 'Arbeitsblattmodi',
    home_integration_items_item_3_description:
      'Binden Sie Aufgabenanweisungen, Abgaberegeln und Ergebnisexporte an denselben eingefrorenen Stand.',
    home_integration_items_item_3_title: 'Aufgabenaufzeichnungen',
    home_integration_learn_more: 'Mehr erfahren',
  },
  ja: {
    home_integration_description:
      'ClassGamify を、教師が普段使っている配布や進捗確認のツールと組み合わせて使えます。',
    home_integration_subtitle: '実際の授業で使える',
    home_integration_title: '授業のワークフロー',
    home_integration_items_item_1_description:
      '授業、個別指導、宿題、復習の前に、生徒用の目的別リンクを共有します。',
    home_integration_items_item_1_title: '生徒リンク',
    home_integration_items_item_2_description:
      '穴埋め、線のマッチング、リスニング、ドラッグ操作の並べ替えをワークシート型モードで作成します。',
    home_integration_items_item_2_title: 'ワークシートモード',
    home_integration_items_item_3_description:
      '課題の説明、提出ルール、結果の書き出しを同じ固定スナップショットに結び付けます。',
    home_integration_items_item_3_title: '課題記録',
    home_integration_learn_more: '詳しく見る',
  },
  ko: {
    home_integration_description:
      '교사가 이미 사용하는 과제 배포 및 진행 상황 검토 도구와 ClassGamify를 함께 사용하세요.',
    home_integration_subtitle: '실제 교실과 함께 작동',
    home_integration_title: '교실 워크플로',
    home_integration_items_item_1_description:
      '수업, 튜터링, 숙제 또는 복습 전에 목적에 맞는 학생 링크를 공유하세요.',
    home_integration_items_item_1_title: '학생 링크',
    home_integration_items_item_2_description:
      '빈칸 채우기, 선 연결, 듣기, 드래그 정렬을 위한 워크시트형 모드를 만드세요.',
    home_integration_items_item_2_title: '워크시트 모드',
    home_integration_items_item_3_description:
      '과제 안내, 제출 규칙, 결과 내보내기를 같은 고정 스냅샷에 연결하세요.',
    home_integration_items_item_3_title: '과제 기록',
    home_integration_learn_more: '더 알아보기',
  },
  it: {
    home_integration_description:
      'Usa ClassGamify insieme agli strumenti che gli insegnanti già usano per distribuire il lavoro e controllare i progressi.',
    home_integration_subtitle: 'Funziona con classi reali',
    home_integration_title: 'Flusso di lavoro in classe',
    home_integration_items_item_1_description:
      'Condividi un link studente mirato prima della lezione, del tutoraggio, dei compiti o del ripasso.',
    home_integration_items_item_1_title: 'Link studente',
    home_integration_items_item_2_description:
      'Crea modalità in stile scheda per completamenti, abbinamenti di righe, ascolto e ordinamento con trascinamento.',
    home_integration_items_item_2_title: 'Modalità scheda',
    home_integration_items_item_3_description:
      'Collega istruzioni, regole di consegna ed esportazioni dei risultati allo stesso snapshot bloccato.',
    home_integration_items_item_3_title: 'Registri dei compiti',
    home_integration_learn_more: 'Scopri di più',
  },
  es: {
    home_integration_description:
      'Usa ClassGamify junto con las herramientas que el profesorado ya utiliza para repartir tareas y revisar el progreso.',
    home_integration_subtitle: 'Funciona con clases reales',
    home_integration_title: 'Flujo de trabajo del aula',
    home_integration_items_item_1_description:
      'Comparte un enlace específico del estudiante antes de clase, tutoría, deberes o repaso.',
    home_integration_items_item_1_title: 'Enlaces de estudiantes',
    home_integration_items_item_2_description:
      'Crea modos tipo ficha para completar espacios, emparejar líneas, escuchar y ordenar arrastrando.',
    home_integration_items_item_2_title: 'Modos de ficha',
    home_integration_items_item_3_description:
      'Mantén las instrucciones, las reglas de entrega y las exportaciones de resultados ligadas a la misma instantánea congelada.',
    home_integration_items_item_3_title: 'Registros de tareas',
    home_integration_learn_more: 'Saber más',
  },
  'pt-BR': {
    home_integration_description:
      'Use a ClassGamify junto com as ferramentas que os professores já usam para distribuir atividades e revisar o progresso.',
    home_integration_subtitle: 'Funciona com turmas reais',
    home_integration_title: 'Fluxo de trabalho em sala',
    home_integration_items_item_1_description:
      'Compartilhe um link específico do aluno antes da aula, tutoria, tarefa ou revisão.',
    home_integration_items_item_1_title: 'Links dos alunos',
    home_integration_items_item_2_description:
      'Crie modos no estilo de ficha para completar lacunas, ligar linhas, ouvir e ordenar por arrastar.',
    home_integration_items_item_2_title: 'Modos de ficha',
    home_integration_items_item_3_description:
      'Mantenha instruções, regras de entrega e exportações de resultados ligadas ao mesmo instantâneo congelado.',
    home_integration_items_item_3_title: 'Registros de tarefas',
    home_integration_learn_more: 'Saiba mais',
  },
  ar: {
    home_integration_description:
      'استخدم ClassGamify إلى جانب الأدوات التي يستخدمها المعلمون بالفعل لتوزيع العمل ومراجعة التقدم.',
    home_integration_subtitle: 'يعمل مع الصفوف الحقيقية',
    home_integration_title: 'سير العمل في الصف',
    home_integration_items_item_1_description:
      'شارك رابطا مركزا للطالب قبل الحصة أو التدريس الخصوصي أو الواجب أو وقت المراجعة.',
    home_integration_items_item_1_title: 'روابط الطلاب',
    home_integration_items_item_2_description:
      'أنشئ أنماط أوراق عمل للملء، ومطابقة الأسطر، والاستماع، والترتيب بالسحب.',
    home_integration_items_item_2_title: 'أنماط أوراق العمل',
    home_integration_items_item_3_description:
      'اربط تعليمات الواجب وقواعد التسليم وتصدير النتائج باللقطة الثابتة نفسها.',
    home_integration_items_item_3_title: 'سجلات الواجبات',
    home_integration_learn_more: 'اعرف المزيد',
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

console.log('Seeded homepage integration core copy for 8 locales');
