import {
  buildMailWorkspaceBoundaryView,
  type MailWorkspaceBoundaryItemView,
} from '@/mail/workspace-boundary';
import { Section, Text } from '@react-email/components';

export default function EmailWorkspaceBoundary() {
  const view = buildMailWorkspaceBoundaryView();

  return (
    <Section
      aria-label={view.title}
      className="mt-6 rounded-lg border border-solid border-gray-200 bg-gray-50 p-4"
    >
      <Text className="m-0 font-semibold text-gray-900">{view.title}</Text>
      <Text className="mt-2 text-gray-700">{view.description}</Text>
      {view.items.map((item) => (
        <EmailWorkspaceBoundaryItem item={item} key={item.id} />
      ))}
    </Section>
  );
}

function EmailWorkspaceBoundaryItem({
  item,
}: {
  item: MailWorkspaceBoundaryItemView;
}) {
  return <Text className="mt-2 text-gray-700">{item.line}</Text>;
}
