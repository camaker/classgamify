import { IconCircleCheck } from '@tabler/icons-react';

interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;
  return (
    <output className="bg-success/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-success-foreground">
      <IconCircleCheck className="size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </output>
  );
}
