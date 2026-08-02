import { readFile, writeFile } from 'node:fs/promises';

const translations: Record<string, Record<string, string>> = {
  fr: {
    activity_library_filter_source_all: 'Toutes les ressources sources',
    activity_library_filter_source_all_description:
      'Afficher toutes les activités enregistrées, avec ou sans fichiers de classe associés.',
    activity_library_filter_source_audio: 'Audio',
    activity_library_filter_source_audio_description:
      "Afficher les activités contenant un support audio prêt pour l'écoute ou l'extraction de la transcription.",
    activity_library_filter_source_extractable: 'Toute ressource exploitable',
    activity_library_filter_source_extractable_description:
      "Afficher les activités contenant un support audio, une fiche ou un tableur prêt pour une future extraction par l'IA.",
    activity_library_filter_source_label: 'Ressource source',
    activity_library_filter_source_selected_description:
      '{source} : {description}',
    activity_library_filter_source_spreadsheet: 'Tableur',
    activity_library_filter_source_spreadsheet_description:
      "Afficher les activités contenant un tableur prêt pour l'importation de vocabulaire ou d'éléments.",
    activity_library_filter_source_worksheet: 'Fiche pédagogique',
    activity_library_filter_source_worksheet_description:
      "Afficher les activités contenant des images ou des documents de fiches prêts pour l'extraction.",
    activity_library_filter_status_description:
      'Passer des activités actives aux activités archivées sans afficher celles des autres enseignants.',
    activity_library_filter_status_label: "Statut de l'activité",
    activity_library_filter_status_selected_description:
      '{status} : {description}',
    activity_library_filter_template_description:
      'Limiter la bibliothèque à une famille de modèles précise ou afficher tous les modèles.',
    activity_library_filter_template_label: 'Modèle',
    activity_library_filter_template_placeholder: 'Tous les modèles',
  },
  de: {
    activity_library_filter_source_all: 'Alle Ausgangsmaterialien',
    activity_library_filter_source_all_description:
      'Alle gespeicherten Aktivitäten anzeigen, unabhängig davon, ob Unterrichtsdateien angehängt sind.',
    activity_library_filter_source_audio: 'Audio',
    activity_library_filter_source_audio_description:
      'Aktivitäten mit Audiomaterial anzeigen, das zum Anhören oder für die Transkription bereitsteht.',
    activity_library_filter_source_extractable: 'Alle auslesbaren Quellen',
    activity_library_filter_source_extractable_description:
      'Aktivitäten mit Audio-, Arbeitsblatt- oder Tabellenmaterial anzeigen, das später per KI ausgelesen werden kann.',
    activity_library_filter_source_label: 'Ausgangsmaterial',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: 'Tabelle',
    activity_library_filter_source_spreadsheet_description:
      'Aktivitäten mit Tabellenmaterial anzeigen, das für den Import von Vokabeln oder Aufgaben bereitsteht.',
    activity_library_filter_source_worksheet: 'Arbeitsblatt',
    activity_library_filter_source_worksheet_description:
      'Aktivitäten mit Arbeitsblattbildern oder -dokumenten anzeigen, die ausgelesen werden können.',
    activity_library_filter_status_description:
      'Zwischen aktiven und archivierten Aktivitäten wechseln, ohne Aktivitäten anderer Lehrkräfte einzubeziehen.',
    activity_library_filter_status_label: 'Aktivitätsstatus',
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      'Die Bibliothek auf eine bestimmte Vorlagenfamilie beschränken oder alle Vorlagen anzeigen.',
    activity_library_filter_template_label: 'Vorlage',
    activity_library_filter_template_placeholder: 'Alle Vorlagen',
  },
  ja: {
    activity_library_filter_source_all: 'すべての元教材',
    activity_library_filter_source_all_description:
      '授業用ファイルの添付有無にかかわらず、保存済みのアクティビティをすべて表示します。',
    activity_library_filter_source_audio: '音声',
    activity_library_filter_source_audio_description:
      '再生または文字起こしに使用できる音声教材付きのアクティビティを表示します。',
    activity_library_filter_source_extractable: '抽出可能なすべての教材',
    activity_library_filter_source_extractable_description:
      '今後AIで抽出できる音声、ワークシート、表計算ファイル付きのアクティビティを表示します。',
    activity_library_filter_source_label: '元教材',
    activity_library_filter_source_selected_description:
      '{source}：{description}',
    activity_library_filter_source_spreadsheet: '表計算ファイル',
    activity_library_filter_source_spreadsheet_description:
      '語彙や問題の取り込みに使用できる表計算ファイル付きのアクティビティを表示します。',
    activity_library_filter_source_worksheet: 'ワークシート',
    activity_library_filter_source_worksheet_description:
      '内容を抽出できるワークシート画像または文書付きのアクティビティを表示します。',
    activity_library_filter_status_description:
      '自分の保存済みアクティビティだけを対象に、使用中とアーカイブ済みを切り替えます。',
    activity_library_filter_status_label: 'アクティビティの状態',
    activity_library_filter_status_selected_description:
      '{status}：{description}',
    activity_library_filter_template_description:
      '特定のテンプレート系列に絞り込むか、すべてのテンプレートを表示します。',
    activity_library_filter_template_label: 'テンプレート',
    activity_library_filter_template_placeholder: 'すべてのテンプレート',
  },
  ko: {
    activity_library_filter_source_all: '모든 원본 자료',
    activity_library_filter_source_all_description:
      '수업 파일 첨부 여부와 관계없이 저장한 모든 활동을 표시합니다.',
    activity_library_filter_source_audio: '오디오',
    activity_library_filter_source_audio_description:
      '듣기 또는 대본 추출에 사용할 수 있는 오디오 자료가 포함된 활동을 표시합니다.',
    activity_library_filter_source_extractable: '추출 가능한 모든 자료',
    activity_library_filter_source_extractable_description:
      '향후 AI로 추출할 수 있는 오디오, 학습지 또는 스프레드시트 자료가 포함된 활동을 표시합니다.',
    activity_library_filter_source_label: '원본 자료',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: '스프레드시트',
    activity_library_filter_source_spreadsheet_description:
      '어휘나 문항을 가져올 수 있는 스프레드시트 자료가 포함된 활동을 표시합니다.',
    activity_library_filter_source_worksheet: '학습지',
    activity_library_filter_source_worksheet_description:
      '내용을 추출할 수 있는 학습지 이미지 또는 문서가 포함된 활동을 표시합니다.',
    activity_library_filter_status_description:
      '내가 저장한 활동 범위 안에서 사용 중인 활동과 보관된 활동을 전환합니다.',
    activity_library_filter_status_label: '활동 상태',
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      '활동 라이브러리를 특정 템플릿 유형으로 좁히거나 모든 템플릿을 표시합니다.',
    activity_library_filter_template_label: '템플릿',
    activity_library_filter_template_placeholder: '모든 템플릿',
  },
  it: {
    activity_library_filter_source_all: 'Tutti i materiali di partenza',
    activity_library_filter_source_all_description:
      'Mostra tutte le attività salvate, con o senza file didattici allegati.',
    activity_library_filter_source_audio: 'Audio',
    activity_library_filter_source_audio_description:
      "Mostra le attività con materiale audio pronto per l'ascolto o l'estrazione della trascrizione.",
    activity_library_filter_source_extractable: 'Qualsiasi fonte estraibile',
    activity_library_filter_source_extractable_description:
      'Mostra le attività con audio, schede o fogli di calcolo pronti per una futura estrazione tramite IA.',
    activity_library_filter_source_label: 'Materiale di partenza',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: 'Foglio di calcolo',
    activity_library_filter_source_spreadsheet_description:
      'Mostra le attività con fogli di calcolo pronti per importare vocaboli o domande.',
    activity_library_filter_source_worksheet: 'Scheda didattica',
    activity_library_filter_source_worksheet_description:
      "Mostra le attività con immagini o documenti di schede pronti per l'estrazione.",
    activity_library_filter_status_description:
      'Passa dalle attività attive a quelle archiviate senza includere attività di altri insegnanti.',
    activity_library_filter_status_label: "Stato dell'attività",
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      'Limita la raccolta a una specifica famiglia di modelli oppure mostra tutti i modelli.',
    activity_library_filter_template_label: 'Modello',
    activity_library_filter_template_placeholder: 'Tutti i modelli',
  },
  es: {
    activity_library_filter_source_all: 'Todos los materiales de origen',
    activity_library_filter_source_all_description:
      'Muestra todas las actividades guardadas, tengan o no archivos de clase adjuntos.',
    activity_library_filter_source_audio: 'Audio',
    activity_library_filter_source_audio_description:
      'Muestra actividades con material de audio listo para escuchar o extraer la transcripción.',
    activity_library_filter_source_extractable: 'Cualquier fuente extraíble',
    activity_library_filter_source_extractable_description:
      'Muestra actividades con audio, fichas u hojas de cálculo listas para una futura extracción con IA.',
    activity_library_filter_source_label: 'Material de origen',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: 'Hoja de cálculo',
    activity_library_filter_source_spreadsheet_description:
      'Muestra actividades con hojas de cálculo listas para importar vocabulario o preguntas.',
    activity_library_filter_source_worksheet: 'Ficha didáctica',
    activity_library_filter_source_worksheet_description:
      'Muestra actividades con imágenes o documentos de fichas listos para extraer su contenido.',
    activity_library_filter_status_description:
      'Cambia entre actividades activas y archivadas sin incluir actividades guardadas por otros docentes.',
    activity_library_filter_status_label: 'Estado de la actividad',
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      'Limita la biblioteca a una familia de plantillas concreta o muestra todas las plantillas.',
    activity_library_filter_template_label: 'Plantilla',
    activity_library_filter_template_placeholder: 'Todas las plantillas',
  },
  'pt-BR': {
    activity_library_filter_source_all: 'Todos os materiais de origem',
    activity_library_filter_source_all_description:
      'Mostra todas as atividades salvas, com ou sem arquivos de aula anexados.',
    activity_library_filter_source_audio: 'Áudio',
    activity_library_filter_source_audio_description:
      'Mostra atividades com material de áudio pronto para ouvir ou extrair a transcrição.',
    activity_library_filter_source_extractable: 'Qualquer fonte extraível',
    activity_library_filter_source_extractable_description:
      'Mostra atividades com áudio, folhas de atividades ou planilhas prontas para futura extração por IA.',
    activity_library_filter_source_label: 'Material de origem',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: 'Planilha',
    activity_library_filter_source_spreadsheet_description:
      'Mostra atividades com planilhas prontas para importar vocabulário ou questões.',
    activity_library_filter_source_worksheet: 'Folha de atividades',
    activity_library_filter_source_worksheet_description:
      'Mostra atividades com imagens ou documentos de folhas prontos para extração.',
    activity_library_filter_status_description:
      'Alterna entre atividades ativas e arquivadas sem incluir atividades salvas por outros professores.',
    activity_library_filter_status_label: 'Status da atividade',
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      'Limita a biblioteca a uma família específica de modelos ou mostra todos os modelos.',
    activity_library_filter_template_label: 'Modelo',
    activity_library_filter_template_placeholder: 'Todos os modelos',
  },
  ar: {
    activity_library_filter_source_all: 'جميع المواد المصدرية',
    activity_library_filter_source_all_description:
      'اعرض جميع الأنشطة المحفوظة، سواء أُرفقت بها ملفات صفية أم لا.',
    activity_library_filter_source_audio: 'صوت',
    activity_library_filter_source_audio_description:
      'اعرض الأنشطة التي تتضمن مادة صوتية جاهزة للاستماع أو استخراج النص.',
    activity_library_filter_source_extractable: 'أي مصدر قابل للاستخراج',
    activity_library_filter_source_extractable_description:
      'اعرض الأنشطة التي تتضمن صوتًا أو أوراق عمل أو جداول بيانات جاهزة للاستخراج بالذكاء الاصطناعي لاحقًا.',
    activity_library_filter_source_label: 'المادة المصدرية',
    activity_library_filter_source_selected_description:
      '{source}: {description}',
    activity_library_filter_source_spreadsheet: 'جدول بيانات',
    activity_library_filter_source_spreadsheet_description:
      'اعرض الأنشطة التي تتضمن جداول بيانات جاهزة لاستيراد المفردات أو الأسئلة.',
    activity_library_filter_source_worksheet: 'ورقة عمل',
    activity_library_filter_source_worksheet_description:
      'اعرض الأنشطة التي تتضمن صورًا أو مستندات لأوراق عمل جاهزة للاستخراج.',
    activity_library_filter_status_description:
      'تنقّل بين الأنشطة النشطة والمؤرشفة ضمن أنشطتك المحفوظة فقط.',
    activity_library_filter_status_label: 'حالة النشاط',
    activity_library_filter_status_selected_description:
      '{status}: {description}',
    activity_library_filter_template_description:
      'اقصر مكتبة الأنشطة على عائلة قوالب محددة أو اعرض جميع القوالب.',
    activity_library_filter_template_label: 'القالب',
    activity_library_filter_template_placeholder: 'جميع القوالب',
  },
};

for (const [locale, localized] of Object.entries(translations)) {
  const path = `project.inlang/messages/${locale}.json`;
  const messages = JSON.parse(await readFile(path, 'utf8')) as Record<
    string,
    string
  >;
  Object.assign(messages, localized);
  await writeFile(path, `${JSON.stringify(messages, null, 2)}\n`);
}

console.log(
  `Localized activity library filters for ${Object.keys(translations).length} locales.`
);
