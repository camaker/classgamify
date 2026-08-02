import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    home_testimonials_subtitle: 'Comment la boucle de classe est utilisée',
    home_testimonials_title: 'Histoires de classe',
    home_testimonials_items_item_1_name: 'Enseignant du primaire',
    home_testimonials_items_item_1_quote:
      'La boucle courte rend la prochaine action évidente : créer l’activité, partager le lien, puis voir qui a besoin d’aide.',
    home_testimonials_items_item_1_role: 'Petite classe',
    home_testimonials_items_item_2_name: 'Tuteur de vocabulaire',
    home_testimonials_items_item_2_quote:
      'Le même contenu devient un jeu d’association, un quiz ou un suivi en fiche sans réécrire la leçon.',
    home_testimonials_items_item_2_role: 'Tutorat individuel',
  },
  de: {
    home_testimonials_subtitle: 'So wird der Klassenablauf genutzt',
    home_testimonials_title: 'Geschichten aus dem Unterricht',
    home_testimonials_items_item_1_name: 'Grundschullehrkraft',
    home_testimonials_items_item_1_quote:
      'Der kurze Ablauf zeigt sofort den nächsten Schritt: Aktivität erstellen, Link teilen und anschließend sehen, wer Hilfe braucht.',
    home_testimonials_items_item_1_role: 'Kleine Klasse',
    home_testimonials_items_item_2_name: 'Vokabel-Tutor',
    home_testimonials_items_item_2_quote:
      'Derselbe Inhalt wird zum Zuordnungsspiel, Quiz oder Arbeitsblatt-Follow-up, ohne die Lektion neu zu schreiben.',
    home_testimonials_items_item_2_role: 'Einzelunterricht',
  },
  ja: {
    home_testimonials_subtitle: '授業のループの使い方',
    home_testimonials_title: '授業のストーリー',
    home_testimonials_items_item_1_name: '小学校教員',
    home_testimonials_items_item_1_quote:
      '短いループなので、次にすることがすぐ分かります。アクティビティを作り、リンクを共有し、助けが必要な生徒を確認できます。',
    home_testimonials_items_item_1_role: '少人数クラス',
    home_testimonials_items_item_2_name: '語彙チューター',
    home_testimonials_items_item_2_quote:
      '同じ内容を、レッスンを書き直さずに、マッチゲーム、クイズ、ワークシート型の復習へ変えられます。',
    home_testimonials_items_item_2_role: '個別指導',
  },
  ko: {
    home_testimonials_subtitle: '교실 루프를 사용하는 방법',
    home_testimonials_title: '교실 이야기',
    home_testimonials_items_item_1_name: '초등 교사',
    home_testimonials_items_item_1_quote:
      '짧은 루프 덕분에 다음 할 일이 분명합니다. 활동을 만들고 링크를 공유한 뒤 도움이 필요한 학생을 확인합니다.',
    home_testimonials_items_item_1_role: '소규모 교실',
    home_testimonials_items_item_2_name: '어휘 튜터',
    home_testimonials_items_item_2_quote:
      '같은 콘텐츠를 수업을 다시 쓰지 않고도 매칭 게임, 퀴즈, 워크시트형 후속 활동으로 바꿀 수 있습니다.',
    home_testimonials_items_item_2_role: '일대일 튜터링',
  },
  it: {
    home_testimonials_subtitle: 'Come viene usato il ciclo della classe',
    home_testimonials_title: 'Storie dalla classe',
    home_testimonials_items_item_1_name: 'Insegnante della primaria',
    home_testimonials_items_item_1_quote:
      'Il ciclo breve rende chiaro il passo successivo: crea l’attività, condividi il link e poi verifica chi ha bisogno di aiuto.',
    home_testimonials_items_item_1_role: 'Piccola classe',
    home_testimonials_items_item_2_name: 'Tutor di vocabolario',
    home_testimonials_items_item_2_quote:
      'Lo stesso contenuto può diventare un gioco di abbinamento, un quiz o un seguito in stile scheda senza riscrivere la lezione.',
    home_testimonials_items_item_2_role: 'Tutoraggio individuale',
  },
  es: {
    home_testimonials_subtitle: 'Cómo se usa el ciclo de clase',
    home_testimonials_title: 'Historias del aula',
    home_testimonials_items_item_1_name: 'Docente de primaria',
    home_testimonials_items_item_1_quote:
      'El ciclo corto deja claro qué hacer después: crear la actividad, compartir el enlace y revisar quién necesita ayuda.',
    home_testimonials_items_item_1_role: 'Clase pequeña',
    home_testimonials_items_item_2_name: 'Tutor de vocabulario',
    home_testimonials_items_item_2_quote:
      'El mismo contenido puede convertirse en un juego de parejas, un cuestionario o una continuación tipo ficha sin reescribir la lección.',
    home_testimonials_items_item_2_role: 'Tutoría individual',
  },
  'pt-BR': {
    home_testimonials_subtitle: 'Como as pessoas usam o ciclo da sala',
    home_testimonials_title: 'Histórias da sala de aula',
    home_testimonials_items_item_1_name: 'Professor do ensino fundamental',
    home_testimonials_items_item_1_quote:
      'O ciclo curto deixa claro o próximo passo: criar a atividade, compartilhar o link e ver quem precisa de ajuda.',
    home_testimonials_items_item_1_role: 'Turma pequena',
    home_testimonials_items_item_2_name: 'Tutor de vocabulário',
    home_testimonials_items_item_2_quote:
      'O mesmo conteúdo pode virar jogo de associação, quiz ou continuação em formato de ficha sem reescrever a aula.',
    home_testimonials_items_item_2_role: 'Tutoria individual',
  },
  ar: {
    home_testimonials_subtitle: 'كيف يستخدم الناس حلقة الصف',
    home_testimonials_title: 'قصص من الصف',
    home_testimonials_items_item_1_name: 'معلم المرحلة الابتدائية',
    home_testimonials_items_item_1_quote:
      'توضح الحلقة القصيرة الخطوة التالية: أنشئ النشاط، شارك الرابط، ثم راجع من يحتاج إلى المساعدة.',
    home_testimonials_items_item_1_role: 'صف صغير',
    home_testimonials_items_item_2_name: 'مدرس مفردات',
    home_testimonials_items_item_2_quote:
      'يمكن تحويل المحتوى نفسه إلى لعبة مطابقة أو اختبار أو متابعة بأسلوب ورقة العمل من دون إعادة كتابة الدرس.',
    home_testimonials_items_item_2_role: 'تدريس فردي',
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

console.log('Seeded homepage testimonial core copy for 8 locales');
