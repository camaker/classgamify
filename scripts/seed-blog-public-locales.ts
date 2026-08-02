import { readFile, writeFile } from 'node:fs/promises';

const copy: Record<string, Record<string, string>> = {
  fr: {
    blog_all_posts: 'Tous les articles',
    blog_description:
      'Les notes de ClassGamify sur les modèles, les liens de devoirs, la rédaction assistée par IA et la revue des résultats par les enseignants.',
    blog_next: 'Suivant',
    blog_no_posts: 'Aucun article pour le moment',
    blog_of: 'sur',
    blog_page: 'Page du blog',
    blog_page_browse_templates: 'Parcourir les modèles',
    blog_page_create_activity: 'Créer une activité',
    blog_page_description:
      'De courts articles sur la création d’activités, la publication de devoirs et l’utilisation de l’IA pour accélérer la préparation.',
    blog_page_eyebrow: 'Activités de classe',
    blog_page_seo_description:
      'Lisez les articles de ClassGamify sur les activités ludiques, les liens de devoirs, les modèles de classe et la création assistée par IA.',
    blog_page_seo_title: 'Ressources pour les activités de classe',
    blog_page_student_preview: 'Aperçu élève',
    blog_page_title: 'Modèles, devoirs et jeux de classe',
    blog_pagination: 'Pagination du blog',
    blog_post_back_to_articles: 'Retour aux articles',
    blog_post_cta_description:
      'Créez une activité, parcourez les modèles ou ouvrez l’aperçu élève pour vérifier l’expérience du devoir.',
    blog_post_cta_title: 'Appliquer cette méthode à la prochaine activité',
    blog_previous: 'Précédent',
    blog_title: 'Journal',
  },
  de: {
    blog_all_posts: 'Alle Beiträge',
    blog_description:
      'ClassGamify-Notizen zu Vorlagen, Aufgabenlinks, KI-Entwürfen und der Ergebnisprüfung durch Lehrkräfte.',
    blog_next: 'Weiter',
    blog_no_posts: 'Noch keine Beiträge',
    blog_of: 'von',
    blog_page: 'Blogseite',
    blog_page_browse_templates: 'Vorlagen durchsuchen',
    blog_page_create_activity: 'Aktivität erstellen',
    blog_page_description:
      'Kurze Artikel zur Erstellung von Klassenaktivitäten, zur Veröffentlichung von Aufgaben und zur schnelleren Vorbereitung mit KI.',
    blog_page_eyebrow: 'Klassenaktivitäten',
    blog_page_seo_description:
      'Lies ClassGamify-Artikel über spielerische Aktivitäten, Aufgabenlinks, Klassenvorlagen und KI-gestützte Erstellung.',
    blog_page_seo_title: 'Ressourcen für Klassenaktivitäten',
    blog_page_student_preview: 'Schülervorschau',
    blog_page_title: 'Vorlagen, Aufgaben und Klassenspiele',
    blog_pagination: 'Blog-Seitennavigation',
    blog_post_back_to_articles: 'Zurück zu den Artikeln',
    blog_post_cta_description:
      'Erstelle eine Aktivität, durchsuche Vorlagen oder öffne die Schülervorschau, um das Aufgabenerlebnis zu prüfen.',
    blog_post_cta_title: 'Diese Methode in der nächsten Aktivität einsetzen',
    blog_previous: 'Zurück',
    blog_title: 'Magazin',
  },
  ja: {
    blog_all_posts: 'すべての記事',
    blog_description:
      'ClassGamify が、テンプレート、課題リンク、AI 下書き、教師による結果確認について紹介します。',
    blog_next: '次へ',
    blog_no_posts: 'まだ記事はありません',
    blog_of: '/',
    blog_page: 'ブログページ',
    blog_page_browse_templates: 'テンプレートを見る',
    blog_page_create_activity: 'アクティビティを作成',
    blog_page_description:
      '授業アクティビティの作成、課題の公開、AI を使った準備の効率化についての短い記事です。',
    blog_page_eyebrow: '授業アクティビティ',
    blog_page_seo_description:
      'ゲーム型アクティビティ、課題リンク、授業テンプレート、AI 支援の作成について ClassGamify の記事を読めます。',
    blog_page_seo_title: '授業アクティビティのリソース',
    blog_page_student_preview: '生徒プレビュー',
    blog_page_title: 'テンプレート、課題、授業ゲーム',
    blog_pagination: 'ブログのページ移動',
    blog_post_back_to_articles: '記事に戻る',
    blog_post_cta_description:
      'アクティビティを作成するか、テンプレートを見たり、生徒プレビューを開いて課題体験を確認したりできます。',
    blog_post_cta_title: 'この方法を次のアクティビティに取り入れる',
    blog_previous: '前へ',
    blog_title: 'ClassGamify便り',
  },
  ko: {
    blog_all_posts: '모든 글',
    blog_description:
      'ClassGamify가 템플릿, 과제 링크, AI 초안, 교사의 결과 검토를 다루는 노트입니다.',
    blog_next: '다음',
    blog_no_posts: '아직 글이 없습니다',
    blog_of: '/',
    blog_page: '블로그 페이지',
    blog_page_browse_templates: '템플릿 둘러보기',
    blog_page_create_activity: '활동 만들기',
    blog_page_description:
      '교실 활동 만들기, 과제 게시, AI로 준비 시간을 줄이는 방법에 관한 짧은 글입니다.',
    blog_page_eyebrow: '교실 활동',
    blog_page_seo_description:
      '게임형 활동, 과제 링크, 교실 템플릿, AI 지원 제작에 관한 ClassGamify 글을 읽어 보세요.',
    blog_page_seo_title: '교실 활동 리소스',
    blog_page_student_preview: '학생 미리 보기',
    blog_page_title: '템플릿, 과제, 교실 게임',
    blog_pagination: '블로그 페이지 이동',
    blog_post_back_to_articles: '글 목록으로 돌아가기',
    blog_post_cta_description:
      '활동을 만들거나 템플릿을 둘러보고 학생 미리 보기를 열어 과제 경험을 확인하세요.',
    blog_post_cta_title: '이 방법을 다음 활동에 적용하기',
    blog_previous: '이전',
    blog_title: 'ClassGamify 소식',
  },
  it: {
    blog_all_posts: 'Tutti gli articoli',
    blog_description:
      'Note di ClassGamify su modelli, link per i compiti, bozze AI e revisione dei risultati da parte degli insegnanti.',
    blog_next: 'Successivo',
    blog_no_posts: 'Nessun articolo per ora',
    blog_of: 'di',
    blog_page: 'Pagina del blog',
    blog_page_browse_templates: 'Sfoglia i modelli',
    blog_page_create_activity: 'Crea attività',
    blog_page_description:
      'Brevi articoli sulla creazione di attività, la pubblicazione dei compiti e l’uso dell’AI per preparare le lezioni più velocemente.',
    blog_page_eyebrow: 'Attività in classe',
    blog_page_seo_description:
      'Leggi gli articoli di ClassGamify su attività basate sul gioco, link per i compiti, modelli di classe e creazione assistita dall’AI.',
    blog_page_seo_title: 'Risorse per le attività in classe',
    blog_page_student_preview: 'Anteprima studente',
    blog_page_title: 'Modelli, compiti e giochi in classe',
    blog_pagination: 'Paginazione del blog',
    blog_post_back_to_articles: 'Torna agli articoli',
    blog_post_cta_description:
      'Crea un’attività, sfoglia i modelli o apri l’anteprima studente per controllare l’esperienza del compito.',
    blog_post_cta_title: 'Porta questo metodo nella prossima attività',
    blog_previous: 'Precedente',
    blog_title: 'Diario',
  },
  es: {
    blog_all_posts: 'Todas las publicaciones',
    blog_description:
      'Notas de ClassGamify sobre plantillas, enlaces de tareas, borradores con IA y revisión de resultados por parte del profesorado.',
    blog_next: 'Siguiente',
    blog_no_posts: 'Aún no hay publicaciones',
    blog_of: 'de',
    blog_page: 'Página del blog',
    blog_page_browse_templates: 'Explorar plantillas',
    blog_page_create_activity: 'Crear actividad',
    blog_page_description:
      'Artículos breves sobre crear actividades, publicar tareas y usar IA para acelerar la preparación.',
    blog_page_eyebrow: 'Actividades de clase',
    blog_page_seo_description:
      'Lee artículos de ClassGamify sobre actividades basadas en juegos, enlaces de tareas, plantillas de aula y creación asistida por IA.',
    blog_page_seo_title: 'Recursos para actividades de clase',
    blog_page_student_preview: 'Vista previa del estudiante',
    blog_page_title: 'Plantillas, tareas y juegos de clase',
    blog_pagination: 'Paginación del blog',
    blog_post_back_to_articles: 'Volver a los artículos',
    blog_post_cta_description:
      'Crea una actividad, explora plantillas o abre la vista previa del estudiante para comprobar la experiencia de la tarea.',
    blog_post_cta_title: 'Aplicar este método a la próxima actividad',
    blog_previous: 'Anterior',
    blog_title: 'Noticias',
  },
  'pt-BR': {
    blog_all_posts: 'Todas as publicações',
    blog_description:
      'Notas da ClassGamify sobre modelos, links de tarefas, rascunhos de IA e revisão de resultados por professores.',
    blog_next: 'Próximo',
    blog_no_posts: 'Ainda não há publicações',
    blog_of: 'de',
    blog_page: 'Página do blog',
    blog_page_browse_templates: 'Ver modelos',
    blog_page_create_activity: 'Criar atividade',
    blog_page_description:
      'Artigos curtos sobre criar atividades, publicar tarefas e usar IA para acelerar o preparo.',
    blog_page_eyebrow: 'Atividades em sala',
    blog_page_seo_description:
      'Leia artigos da ClassGamify sobre atividades com jogos, links de tarefas, modelos de sala e criação assistida por IA.',
    blog_page_seo_title: 'Recursos para atividades em sala',
    blog_page_student_preview: 'Prévia do aluno',
    blog_page_title: 'Modelos, tarefas e jogos em sala',
    blog_pagination: 'Paginação do blog',
    blog_post_back_to_articles: 'Voltar aos artigos',
    blog_post_cta_description:
      'Crie uma atividade, explore modelos ou abra a prévia do aluno para conferir a experiência da tarefa.',
    blog_post_cta_title: 'Levar este método para a próxima atividade',
    blog_previous: 'Anterior',
    blog_title: 'Diário',
  },
  ar: {
    blog_all_posts: 'كل المقالات',
    blog_description:
      'ملاحظات ClassGamify حول القوالب وروابط الواجبات والمسودات بالذكاء الاصطناعي ومراجعة النتائج من قبل المعلمين.',
    blog_next: 'التالي',
    blog_no_posts: 'لا توجد مقالات بعد',
    blog_of: 'من',
    blog_page: 'صفحة المدونة',
    blog_page_browse_templates: 'تصفح القوالب',
    blog_page_create_activity: 'أنشئ نشاطا',
    blog_page_description:
      'مقالات قصيرة حول إنشاء أنشطة الصف ونشر الواجبات واستخدام الذكاء الاصطناعي لتسريع التحضير.',
    blog_page_eyebrow: 'أنشطة الصف',
    blog_page_seo_description:
      'اقرأ مقالات ClassGamify عن الأنشطة القائمة على الألعاب وروابط الواجبات وقوالب الصف والإنشاء بمساعدة الذكاء الاصطناعي.',
    blog_page_seo_title: 'موارد أنشطة الصف',
    blog_page_student_preview: 'معاينة الطالب',
    blog_page_title: 'القوالب والواجبات وألعاب الصف',
    blog_pagination: 'ترقيم صفحات المدونة',
    blog_post_back_to_articles: 'العودة إلى المقالات',
    blog_post_cta_description:
      'أنشئ نشاطا أو تصفح القوالب أو افتح معاينة الطالب للتحقق من تجربة الواجب.',
    blog_post_cta_title: 'طبّق هذه الطريقة في النشاط التالي',
    blog_previous: 'السابق',
    blog_title: 'مدونة ClassGamify',
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

console.log('Seeded public blog copy for 8 locales');
