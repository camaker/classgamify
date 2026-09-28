import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const NORMALIZED_TEST_CATALOG_SOURCE = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

test('classroom product loop chain is documented in product and catalog', () => {
  assert.match(
    PRODUCT_SOURCE,
    /ClassGamify is a teacher-first activity and assignment platform[\s\S]*teachers create reusable activity content[\s\S]*publish assignments[\s\S]*review student attempts/,
    'docs/product.md should define the teacher-first product loop.'
  );
  assert.match(
    PRODUCT_SOURCE,
    /Activity -> Assignment -> Attempt -> Results/,
    'docs/product.md should keep the explicit classroom loop sequence.'
  );
  assert.match(
    NORMALIZED_TEST_CATALOG_SOURCE,
    /Classroom product loop chain has a fast script-level gate via[\s\S]*scripts\/classroom-product-loop-chain\.test\.ts[\s\S]*Activity -> Assignment -> Attempt -> Results[\s\S]*assignment source activity context boundary[\s\S]*classroom data lifecycle[\s\S]*activity library page boundary[\s\S]*activity authoring\/library workflow[\s\S]*source extraction lifecycle[\s\S]*activity lifecycle governance[\s\S]*template roadmap capability[\s\S]*AI enhancement lifecycle[\s\S]*published assignment delivery[\s\S]*assignment publish preflight boundary[\s\S]*assignment lifecycle governance boundary[\s\S]*assignment distribution lifecycle boundary[\s\S]*public assignment rules boundary[\s\S]*student runner play[\s\S]*student identity lifecycle[\s\S]*student runtime identity boundary[\s\S]*assignment submission validation boundary[\s\S]*assignment attempt persistence boundary[\s\S]*scored attempt results[\s\S]*assignment attempt stats boundary[\s\S]*answer feedback lifecycle[\s\S]*assignment attempt duration boundary[\s\S]*submitted-date continuity[\s\S]*accepted-answer continuity[\s\S]*explanation continuity[\s\S]*teacher result review[\s\S]*teacher result copy lifecycle[\s\S]*worksheet-mode delivery boundary[\s\S]*printable worksheet review lifecycle[\s\S]*copy\/export\/print handoffs[\s\S]*teacher workspace operations[\s\S]*public discovery[\s\S]*privacy guards/,
    'TEST-CATALOG should document the classroom product loop chain gate.'
  );
});
