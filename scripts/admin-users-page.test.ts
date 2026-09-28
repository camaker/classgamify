import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAdminUsersPageViewModel } from '@/admin/users-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('admin users page view model carries teacher-account breadcrumbs', () => {
  const pageView = buildAdminUsersPageViewModel();

  assert.equal(pageView.title, 'Teacher accounts');
  assert.deepEqual(pageView.breadcrumbs, [
    { id: 'admin', label: 'Admin', isCurrentPage: false },
    { id: 'users', label: 'Teacher accounts', isCurrentPage: true },
  ]);
  assert.equal(
    pageView.contentAriaLabel,
    'Teacher accounts content and classroom data boundaries'
  );
});
