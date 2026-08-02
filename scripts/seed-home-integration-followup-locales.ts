import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    home_integration_items_item_4_description:
      'Utilisez le formulaire de classe pour décrire les élèves, les routines, les fiches et les besoins de revue des résultats.',
    home_integration_items_item_4_title: 'Demande pour la classe',
    home_integration_items_item_5_description:
      'Transformez les tentatives en prochaine leçon grâce aux briefs de classe, aux plans de remédiation et aux synthèses de suivi.',
    home_integration_items_item_5_title: 'Supports de révision',
    home_integration_items_item_6_description:
      'Suivez les demandes de feuille de route pour l’audio enseignant, l’extraction de fiches, les remixes IA et des modèles plus riches.',
    home_integration_items_item_6_title: 'Feuille de route des modèles',
  },
  de: {
    home_integration_items_item_4_description:
      'Beschreiben Sie über die Klassenanfrage Schüler, Routinen, Arbeitsblätter und den Bedarf an Ergebnisprüfung.',
    home_integration_items_item_4_title: 'Klassenanfrage',
    home_integration_items_item_5_description:
      'Machen Sie aus Versuchen die nächste Unterrichtsstunde mit Klassenbriefs, Förderplänen und Nachfass-Zusammenfassungen.',
    home_integration_items_item_5_title: 'Prüfunterlagen',
    home_integration_items_item_6_description:
      'Verfolgen Sie Roadmap-Wünsche für Lehrer-Audio, Arbeitsblatt-Extraktion, KI-Remixe und umfangreichere Vorlagen.',
    home_integration_items_item_6_title: 'Vorlagen-Roadmap',
  },
  ja: {
    home_integration_items_item_4_description:
      '授業の問い合わせフローで、生徒、ルーティン、ワークシート、結果確認のニーズを伝えます。',
    home_integration_items_item_4_title: '授業の問い合わせ',
    home_integration_items_item_5_description:
      '授業の概要、補習プラン、フォローアップのまとめを使い、取り組みを次のレッスンにつなげます。',
    home_integration_items_item_5_title: '復習資料',
    home_integration_items_item_6_description:
      '教師音声、ワークシート抽出、AI アレンジ、より豊かなテンプレートへの要望をロードマップで追跡します。',
    home_integration_items_item_6_title: 'テンプレートのロードマップ',
  },
  ko: {
    home_integration_items_item_4_description:
      '교실 문의 흐름으로 학생, 루틴, 워크시트, 결과 검토 요구를 설명하세요.',
    home_integration_items_item_4_title: '교실 문의',
    home_integration_items_item_5_description:
      '교실 브리핑, 보충 학습 계획, 후속 요약으로 시도를 다음 수업으로 연결하세요.',
    home_integration_items_item_5_title: '복습 자료',
    home_integration_items_item_6_description:
      '교사 음성, 워크시트 추출, AI 리믹스, 더 풍부한 템플릿에 대한 로드맵 요청을 추적하세요.',
    home_integration_items_item_6_title: '템플릿 로드맵',
  },
  it: {
    home_integration_items_item_4_description:
      'Usa il flusso di richiesta per descrivere studenti, routine, schede e necessità di revisione dei risultati.',
    home_integration_items_item_4_title: 'Richiesta per la classe',
    home_integration_items_item_5_description:
      'Trasforma i tentativi nella lezione successiva con brief di classe, piani di recupero e riepiloghi di follow-up.',
    home_integration_items_item_5_title: 'Materiali di revisione',
    home_integration_items_item_6_description:
      'Segui le richieste di roadmap per audio degli insegnanti, estrazione di schede, remix AI e modelli più ricchi.',
    home_integration_items_item_6_title: 'Roadmap dei modelli',
  },
  es: {
    home_integration_items_item_4_description:
      'Usa el formulario de aula para describir estudiantes, rutinas, fichas y necesidades de revisión de resultados.',
    home_integration_items_item_4_title: 'Consulta del aula',
    home_integration_items_item_5_description:
      'Convierte los intentos en la próxima lección con informes de clase, planes de refuerzo y resúmenes de seguimiento.',
    home_integration_items_item_5_title: 'Materiales de revisión',
    home_integration_items_item_6_description:
      'Sigue las solicitudes de hoja de ruta para audio del profesorado, extracción de fichas, remixes con IA y plantillas más completas.',
    home_integration_items_item_6_title: 'Hoja de ruta de plantillas',
  },
  'pt-BR': {
    home_integration_items_item_4_description:
      'Use o fluxo de contato da turma para descrever alunos, rotinas, fichas e necessidades de revisão de resultados.',
    home_integration_items_item_4_title: 'Contato da turma',
    home_integration_items_item_5_description:
      'Transforme tentativas na próxima aula com briefs da turma, planos de reforço e resumos de acompanhamento.',
    home_integration_items_item_5_title: 'Materiais de revisão',
    home_integration_items_item_6_description:
      'Acompanhe pedidos de roadmap para áudio do professor, extração de fichas, remixes de IA e modelos mais completos.',
    home_integration_items_item_6_title: 'Roadmap de modelos',
  },
  ar: {
    home_integration_items_item_4_description:
      'استخدم مسار الاستفسار الصفي لوصف الطلاب والروتين وأوراق العمل واحتياجات مراجعة النتائج.',
    home_integration_items_item_4_title: 'استفسار صفي',
    home_integration_items_item_5_description:
      'حوّل المحاولات إلى درس تال باستخدام ملخصات الصف وخطط إعادة التعليم وملخصات المتابعة.',
    home_integration_items_item_5_title: 'مواد المراجعة',
    home_integration_items_item_6_description:
      'تتبع طلبات خارطة الطريق لصوت المعلم واستخراج أوراق العمل وإعادة المزج بالذكاء الاصطناعي والقوالب الأغنى.',
    home_integration_items_item_6_title: 'خارطة طريق القوالب',
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

console.log('Seeded homepage integration follow-up copy for 8 locales');
