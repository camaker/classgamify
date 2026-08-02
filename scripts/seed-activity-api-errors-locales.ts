import { readFile, writeFile } from 'node:fs/promises';

const keys = [
  'activity_api_error_activity_not_found',
  'activity_api_error_create_load_failed',
  'activity_api_error_duplicate_load_failed',
  'activity_api_error_remix_load_failed',
  'activity_api_error_remix_same_template',
  'activity_api_error_template_not_found',
  'activity_api_error_write_conflict',
] as const;

const translations: Record<string, string[]> = {
  fr: [
    'Activité introuvable.',
    "L'activité a été enregistrée, mais son chargement a échoué.",
    "La copie de l'activité a été enregistrée, mais son chargement a échoué.",
    "Le remix de l'activité a été enregistré, mais son chargement a échoué.",
    'Choisissez un autre modèle pour créer le remix.',
    'Modèle introuvable.',
    'Cette activité a été modifiée par une autre requête. Rechargez-la avant de réessayer.',
  ],
  de: [
    'Aktivität nicht gefunden.',
    'Die Aktivität wurde gespeichert, konnte aber nicht geladen werden.',
    'Die Aktivitätskopie wurde gespeichert, konnte aber nicht geladen werden.',
    'Der Aktivitäts-Remix wurde gespeichert, konnte aber nicht geladen werden.',
    'Wählen Sie für den Remix eine andere Vorlage.',
    'Vorlage nicht gefunden.',
    'Diese Aktivität wurde durch eine andere Anfrage geändert. Laden Sie sie neu, bevor Sie es erneut versuchen.',
  ],
  ja: [
    'アクティビティが見つかりません。',
    'アクティビティは保存されましたが、読み込めませんでした。',
    '複製したアクティビティは保存されましたが、読み込めませんでした。',
    'Remixしたアクティビティは保存されましたが、読み込めませんでした。',
    'Remix先には別のテンプレートを選択してください。',
    'テンプレートが見つかりません。',
    '別のリクエストでこのアクティビティが更新されました。再読み込みしてからもう一度お試しください。',
  ],
  ko: [
    '활동을 찾을 수 없습니다.',
    '활동은 저장되었지만 불러오지 못했습니다.',
    '복제한 활동은 저장되었지만 불러오지 못했습니다.',
    '리믹스한 활동은 저장되었지만 불러오지 못했습니다.',
    '리믹스할 다른 템플릿을 선택하세요.',
    '템플릿을 찾을 수 없습니다.',
    '다른 요청에서 이 활동이 변경되었습니다. 새로고침한 뒤 다시 시도하세요.',
  ],
  it: [
    'Attività non trovata.',
    "L'attività è stata salvata, ma non è stato possibile caricarla.",
    "La copia dell'attività è stata salvata, ma non è stato possibile caricarla.",
    "Il remix dell'attività è stato salvato, ma non è stato possibile caricarlo.",
    'Scegli un modello diverso per il remix.',
    'Modello non trovato.',
    "Questa attività è stata modificata da un'altra richiesta. Ricaricala prima di riprovare.",
  ],
  es: [
    'No se encontró la actividad.',
    'La actividad se guardó, pero no se pudo cargar.',
    'La copia de la actividad se guardó, pero no se pudo cargar.',
    'El remix de la actividad se guardó, pero no se pudo cargar.',
    'Elige una plantilla diferente para el remix.',
    'No se encontró la plantilla.',
    'Otra solicitud modificó esta actividad. Vuelve a cargarla antes de intentarlo de nuevo.',
  ],
  'pt-BR': [
    'Atividade não encontrada.',
    'A atividade foi salva, mas não pôde ser carregada.',
    'A cópia da atividade foi salva, mas não pôde ser carregada.',
    'O remix da atividade foi salvo, mas não pôde ser carregado.',
    'Escolha outro modelo para fazer o remix.',
    'Modelo não encontrado.',
    'Esta atividade foi alterada por outra solicitação. Recarregue antes de tentar novamente.',
  ],
  ar: [
    'لم يتم العثور على النشاط.',
    'تم حفظ النشاط، لكن تعذر تحميله.',
    'تم حفظ نسخة النشاط، لكن تعذر تحميلها.',
    'تم حفظ النسخة المعاد مزجها، لكن تعذر تحميلها.',
    'اختر قالبًا مختلفًا لإعادة المزج.',
    'لم يتم العثور على القالب.',
    'تغير هذا النشاط في طلب آخر. أعد تحميله قبل المحاولة مجددًا.',
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
  `Localized activity API errors for ${Object.keys(translations).length} locales.`
);
