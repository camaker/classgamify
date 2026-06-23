export async function copyTextToClipboard(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  copyTextWithTextarea(value);
}

class ClipboardCopyError extends Error {
  constructor() {
    super();
    this.name = 'ClipboardCopyError';
  }
}

function copyTextWithTextarea(value: string) {
  if (typeof document === 'undefined') {
    throw new ClipboardCopyError();
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  if (!copied) {
    throw new ClipboardCopyError();
  }
}
