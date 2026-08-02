import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'activity_created_panel_loading_title',
  'activity_created_panel_loading_body',
  'activity_created_panel_missing_title',
  'activity_created_panel_missing_body',
] as const;

const translations: Record<string, string[]> = {
  fr: [
    'La nouvelle activité est ajoutée à votre bibliothèque.',
    "Chargement de l'activité enregistrée et des prochaines actions de classe.",
    'Activité enregistrée dans votre bibliothèque.',
    "L'activité est enregistrée, mais n'apparaît pas encore dans la liste actuelle. Un filtre ou la pagination peut la masquer.",
  ],
  de: [
    'Die neue Aktivität wird Ihrer Bibliothek hinzugefügt.',
    'Die gespeicherte Aktivität und die nächsten Unterrichtsschritte werden geladen.',
    'Aktivität in Ihrer Bibliothek gespeichert.',
    'Die Aktivität wurde gespeichert, ist aber in der aktuellen Liste noch nicht sichtbar. Filter oder Seitennavigation können sie ausblenden.',
  ],
  ja: [
    '新しいアクティビティをライブラリに追加しています。',
    '保存したアクティビティと次の授業操作を読み込んでいます。',
    'アクティビティをライブラリに保存しました。',
    'アクティビティは保存されましたが、現在の一覧にはまだ表示されていません。フィルターまたはページ分割で隠れている可能性があります。',
  ],
  ko: [
    '새 활동을 라이브러리에 추가하고 있습니다.',
    '저장한 활동과 다음 수업 작업을 불러오고 있습니다.',
    '활동을 라이브러리에 저장했습니다.',
    '활동은 저장되었지만 현재 목록에는 아직 보이지 않습니다. 필터 또는 페이지 구분으로 숨겨져 있을 수 있습니다.',
  ],
  it: [
    'La nuova attività viene aggiunta alla raccolta.',
    "Caricamento dell'attività salvata e delle prossime azioni per la classe.",
    'Attività salvata nella raccolta.',
    "L'attività è stata salvata, ma non è ancora visibile nell'elenco corrente. I filtri o la paginazione potrebbero nasconderla.",
  ],
  es: [
    'La nueva actividad se está añadiendo a tu biblioteca.',
    'Cargando la actividad guardada y las siguientes acciones de clase.',
    'Actividad guardada en tu biblioteca.',
    'La actividad se ha guardado, pero todavía no aparece en la lista actual. Puede estar oculta por los filtros o la paginación.',
  ],
  'pt-BR': [
    'A nova atividade está sendo adicionada à sua biblioteca.',
    'Carregando a atividade salva e as próximas ações para a aula.',
    'Atividade salva na sua biblioteca.',
    'A atividade foi salva, mas ainda não aparece na lista atual. Os filtros ou a paginação podem estar ocultando o item.',
  ],
  ar: [
    'تجري إضافة النشاط الجديد إلى مكتبتك.',
    'جارٍ تحميل النشاط المحفوظ والخطوات الصفية التالية.',
    'تم حفظ النشاط في مكتبتك.',
    'تم حفظ النشاط، لكنه لا يظهر بعد في القائمة الحالية. قد تخفيه عوامل التصفية أو تقسيم الصفحات.',
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
  `Localized activity-created status copy for ${Object.keys(translations).length} locales.`
);
