import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    home_testimonials_items_item_3_name: 'Mme Chen',
    home_testimonials_items_item_3_quote:
      'La vue des résultats transforme les devoirs en plan rapide de remédiation, plutôt qu’en simple tableau de scores.',
    home_testimonials_items_item_3_role: 'Cours après l’école',
    home_testimonials_items_item_4_name: 'Parent accompagnateur',
    home_testimonials_items_item_4_quote:
      'Je peux ouvrir le lien élève, voir le résumé de la tentative et savoir quoi revoir ensuite.',
    home_testimonials_items_item_4_role: 'Pratique en famille',
    home_testimonials_items_item_5_name: 'Enseignant de classe',
    home_testimonials_items_item_5_quote:
      'Le flux de devoirs est assez précis pour une petite classe : jouer, envoyer, puis revoir.',
    home_testimonials_items_item_5_role: 'Cours du week-end',
    home_testimonials_items_item_6_name: 'Premier soutien',
    home_testimonials_items_item_6_quote:
      'Le produit commence avec des modèles pratiques tout en ouvrant clairement la voie à des fiches plus riches assistées par IA.',
    home_testimonials_items_item_6_role: 'Adoptant précoce',
  },
  de: {
    home_testimonials_items_item_3_name: 'Frau Chen',
    home_testimonials_items_item_3_quote:
      'Die Ergebnisansicht macht aus Hausaufgaben einen schnellen Förderplan statt nur einer weiteren Punktetabelle.',
    home_testimonials_items_item_3_role: 'Nachmittagskurs',
    home_testimonials_items_item_4_name: 'Elternbegleitung',
    home_testimonials_items_item_4_quote:
      'Ich kann einen Schülerlink öffnen, die Versuchsübersicht ansehen und weiß, was als Nächstes wiederholt werden sollte.',
    home_testimonials_items_item_4_role: 'Üben in der Familie',
    home_testimonials_items_item_5_name: 'Klassenlehrkraft',
    home_testimonials_items_item_5_quote:
      'Der Aufgabenablauf passt auch für eine kleine Klasse: erst spielen, dann abgeben, danach prüfen.',
    home_testimonials_items_item_5_role: 'Wochenendkurs',
    home_testimonials_items_item_6_name: 'Früher Unterstützer',
    home_testimonials_items_item_6_quote:
      'Das Produkt startet mit praktischen Vorlagen und lässt zugleich Raum für reichhaltigere KI-gestützte Arbeitsblattabläufe.',
    home_testimonials_items_item_6_role: 'Früher Nutzer',
  },
  ja: {
    home_testimonials_items_item_3_name: 'Chen先生',
    home_testimonials_items_item_3_quote:
      '結果画面が宿題を、ただの点数表ではなく、すぐ使える補習プランに変えてくれます。',
    home_testimonials_items_item_3_role: '放課後クラス',
    home_testimonials_items_item_4_name: '家庭学習のサポーター',
    home_testimonials_items_item_4_quote:
      '生徒用リンクを開いて取り組みの概要を確認し、次に復習する内容が分かります。',
    home_testimonials_items_item_4_role: '家庭学習',
    home_testimonials_items_item_5_name: '授業担当教員',
    home_testimonials_items_item_5_quote:
      '少人数クラスにも合う課題の流れです。まず遊び、次に提出し、その後で確認できます。',
    home_testimonials_items_item_5_role: '週末クラス',
    home_testimonials_items_item_6_name: '初期サポーター',
    home_testimonials_items_item_6_quote:
      '実用的なテンプレートから始めながら、AI 支援のより豊かなワークシートにも広がることが分かります。',
    home_testimonials_items_item_6_role: '初期ユーザー',
  },
  ko: {
    home_testimonials_items_item_3_name: 'Chen 선생님',
    home_testimonials_items_item_3_quote:
      '결과 화면은 숙제를 또 하나의 점수표가 아니라 빠른 보충 학습 계획으로 바꿔 줍니다.',
    home_testimonials_items_item_3_role: '방과 후 수업',
    home_testimonials_items_item_4_name: '부모 코치',
    home_testimonials_items_item_4_quote:
      '학생 링크를 열고 시도 요약을 확인하면 다음에 무엇을 복습할지 알 수 있습니다.',
    home_testimonials_items_item_4_role: '가정 학습',
    home_testimonials_items_item_5_name: '교실 교사',
    home_testimonials_items_item_5_quote:
      '작은 교실에도 맞는 과제 흐름입니다. 먼저 플레이하고, 제출한 다음, 검토할 수 있습니다.',
    home_testimonials_items_item_5_role: '주말 수업',
    home_testimonials_items_item_6_name: '초기 후원자',
    home_testimonials_items_item_6_quote:
      '실용적인 템플릿으로 시작하면서도 더 풍부한 AI 지원 워크시트 흐름으로 확장할 여지가 분명합니다.',
    home_testimonials_items_item_6_role: '초기 사용자',
  },
  it: {
    home_testimonials_items_item_3_name: 'Signora Chen',
    home_testimonials_items_item_3_quote:
      'La vista dei risultati trasforma i compiti in un rapido piano di recupero, non nell’ennesima tabella di punteggi.',
    home_testimonials_items_item_3_role: 'Corso doposcuola',
    home_testimonials_items_item_4_name: 'Genitore accompagnatore',
    home_testimonials_items_item_4_quote:
      'Posso aprire il link dello studente, vedere il riepilogo del tentativo e sapere cosa ripassare dopo.',
    home_testimonials_items_item_4_role: 'Pratica in famiglia',
    home_testimonials_items_item_5_name: 'Insegnante di classe',
    home_testimonials_items_item_5_quote:
      'Il flusso dei compiti è abbastanza preciso per una classe piccola: giocare, consegnare, poi rivedere.',
    home_testimonials_items_item_5_role: 'Classe del fine settimana',
    home_testimonials_items_item_6_name: 'Primo sostenitore',
    home_testimonials_items_item_6_quote:
      'Il prodotto parte da modelli pratici ma lascia chiaramente spazio a flussi di schede più ricchi e assistiti dall’AI.',
    home_testimonials_items_item_6_role: 'Primo utilizzatore',
  },
  es: {
    home_testimonials_items_item_3_name: 'Señora Chen',
    home_testimonials_items_item_3_quote:
      'La vista de resultados convierte los deberes en un plan rápido de refuerzo, no en otra tabla de puntuaciones.',
    home_testimonials_items_item_3_role: 'Clase extraescolar',
    home_testimonials_items_item_4_name: 'Acompañante familiar',
    home_testimonials_items_item_4_quote:
      'Puedo abrir el enlace del estudiante, ver el resumen del intento y saber qué repasar después.',
    home_testimonials_items_item_4_role: 'Práctica en familia',
    home_testimonials_items_item_5_name: 'Docente de aula',
    home_testimonials_items_item_5_quote:
      'El flujo de tareas es suficientemente concreto para una clase pequeña: jugar, entregar y revisar.',
    home_testimonials_items_item_5_role: 'Clase de fin de semana',
    home_testimonials_items_item_6_name: 'Primer colaborador',
    home_testimonials_items_item_6_quote:
      'El producto empieza con plantillas prácticas y deja claro que puede crecer hacia flujos de fichas más ricos con ayuda de IA.',
    home_testimonials_items_item_6_role: 'Usuario inicial',
  },
  'pt-BR': {
    home_testimonials_items_item_3_name: 'Sra. Chen',
    home_testimonials_items_item_3_quote:
      'A tela de resultados transforma a tarefa em um plano rápido de recuperação, em vez de apenas outra tabela de notas.',
    home_testimonials_items_item_3_role: 'Aula no contraturno',
    home_testimonials_items_item_4_name: 'Acompanhante dos pais',
    home_testimonials_items_item_4_quote:
      'Posso abrir o link do aluno, ver o resumo da tentativa e saber o que revisar depois.',
    home_testimonials_items_item_4_role: 'Prática em família',
    home_testimonials_items_item_5_name: 'Professor da turma',
    home_testimonials_items_item_5_quote:
      'O fluxo de tarefas é específico o bastante para uma turma pequena: jogar, enviar e revisar.',
    home_testimonials_items_item_5_role: 'Aula de fim de semana',
    home_testimonials_items_item_6_name: 'Primeiro apoiador',
    home_testimonials_items_item_6_quote:
      'O produto começa com modelos práticos, mas deixa claro que pode crescer para fluxos de fichas mais ricos com ajuda de IA.',
    home_testimonials_items_item_6_role: 'Usuário inicial',
  },
  ar: {
    home_testimonials_items_item_3_name: 'السيدة تشن',
    home_testimonials_items_item_3_quote:
      'تحول شاشة النتائج الواجب إلى خطة سريعة لإعادة التعليم بدلا من جدول درجات آخر.',
    home_testimonials_items_item_3_role: 'صف ما بعد المدرسة',
    home_testimonials_items_item_4_name: 'مرشد الوالدين',
    home_testimonials_items_item_4_quote:
      'يمكنني فتح رابط الطالب ومشاهدة ملخص المحاولة ومعرفة ما يحتاج إلى مراجعة بعد ذلك.',
    home_testimonials_items_item_4_role: 'تدريب عائلي',
    home_testimonials_items_item_5_name: 'معلم الصف',
    home_testimonials_items_item_5_quote:
      'تدفق الواجب محدد بما يكفي للصف الصغير: العب أولا، أرسل الإجابة، ثم راجع.',
    home_testimonials_items_item_5_role: 'صف نهاية الأسبوع',
    home_testimonials_items_item_6_name: 'داعم مبكر',
    home_testimonials_items_item_6_quote:
      'يبدأ المنتج بقوالب عملية، لكنه يترك بوضوح مجالا لتدفقات أوراق عمل أغنى بمساعدة الذكاء الاصطناعي.',
    home_testimonials_items_item_6_role: 'مستخدم مبكر',
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

console.log('Seeded remaining homepage testimonial copy for 8 locales');
