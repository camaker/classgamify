import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMarkdown } from '@/lib/markdown';

test('renders public markdown synchronously for server HTML', () => {
  const result = renderMarkdown(`## Review before publishing

Use the [activity templates](/templates) before publishing.

![Teacher preview](/images/teacher-preview.png)

- Verify the answer
- Preview the student experience
`);

  assert.match(
    result.markup,
    /<h2 id="review-before-publishing"><a class="anchor" href="#review-before-publishing">Review before publishing<\/a><\/h2>/
  );
  assert.match(
    result.markup,
    /href="\/templates" class="underline-offset-4 hover:underline"/
  );
  assert.match(result.markup, /loading="lazy" class="rounded-lg shadow-md"/);
  assert.match(result.markup, /<li>Verify the answer<\/li>/);
  assert.doesNotMatch(result.markup, />Loading(?:\.\.\.)?</i);
  assert.doesNotMatch(result.markup, /加载中/);
});
