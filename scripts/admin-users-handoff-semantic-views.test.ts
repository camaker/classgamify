import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_USERS_HANDOFF_ITEM_IDS,
  buildAdminUsersHandoffView,
  buildAdminUsersPageViewModel,
  type AdminUsersHandoffItemId,
  type AdminUsersHandoffView,
} from '@/admin/users-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_EMAIL = 'teacher-private@example.test';
const SECRET_SEARCH_TEXT = 'private classroom search text';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote the private answer';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';

test('admin users handoff exposes 30 safe teacher-account governance slices', () => {
  const handoffView = buildAdminUsersHandoffView({
    filters: [
      { id: 'role', value: 'user' },
      { id: 'status', value: 'inactive' },
    ],
    loading: true,
    pageIndex: 2,
    pageSize: 25,
    search: SECRET_SEARCH_TEXT,
    sorting: [{ id: 'email', desc: false }],
    total: 37,
    visibleCount: 12,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ADMIN_USERS_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    changesActivityContent: false,
    changesAssignmentLinks: false,
    exposesActivityContent: false,
    exposesAssignmentSnapshots: false,
    exposesRawStudentIdentifiers: false,
    exposesSearchText: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswers: false,
    exposesUserEmails: false,
    itemIds,
    scope: 'admin-user-governance',
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['admin-scope', 'Teacher account governance'],
      ['route-gate', 'Protected admin route'],
      ['admin-role-boundary', 'Admin-only changes'],
      ['user-list-query', 'Owner account query'],
      ['search-state', 'Search active'],
      ['role-filter', 'Teacher'],
      ['status-filter', 'Inactive'],
      ['sort-state', 'Email ascending'],
      ['pagination-state', 'Page 3 · 25 per page'],
      ['visible-rows', '12'],
      ['total-users', '37'],
      ['loading-state', 'Loading'],
      ['table-columns', 'Governance columns'],
      ['name-column', 'Name'],
      ['email-column', 'Email'],
      ['email-copy-action', 'Clipboard guarded'],
      ['email-verification-status', 'Status badges'],
      ['role-column', 'Role'],
      ['status-column', 'Status'],
      ['ban-reason-column', 'Ban reason'],
      ['ban-expiry-column', 'Ban expires'],
      ['detail-drawer', 'Admin only'],
      ['ban-action', 'Ban account'],
      ['unban-action', 'Unban account'],
      ['ban-reason-required', 'Required'],
      ['ban-expiry-optional', 'Optional'],
      ['mutation-feedback', 'Localized toasts'],
      ['activity-content-boundary', 'Not exposed'],
      ['assignment-link-boundary', 'No link changes'],
      ['student-result-boundary', 'Private results'],
    ]
  );
  assertNoPrivateAdminUsersText(JSON.stringify(handoffView));
});

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

test('admin users handoff localizes Chinese governance boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAdminUsersHandoffView({
      filters: [
        { id: 'role', value: 'admin' },
        { id: 'status', value: 'active' },
      ],
      loading: false,
      pageIndex: 0,
      pageSize: 10,
      search: '',
      sorting: [],
      total: 8,
      visibleCount: 8,
    });

    assert.equal(handoffView.title, '教师账号治理');
    assert.match(handoffView.description, /30 切片管理员用户治理契约/);
    assert.equal(
      getHandoffItemValue(handoffView, 'admin-scope'),
      '教师账号治理'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'route-gate'),
      '受保护管理员路由'
    );
    assert.equal(getHandoffItemValue(handoffView, 'search-state'), '未搜索');
    assert.equal(getHandoffItemValue(handoffView, 'role-filter'), '管理员');
    assert.equal(getHandoffItemValue(handoffView, 'status-filter'), '账号正常');
    assert.equal(
      getHandoffItemValue(handoffView, 'sort-state'),
      '最新教师账号优先'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'pagination-state'),
      '第 1 页 · 每页 10 条'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'assignment-link-boundary'),
      '不改链接'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'student-result-boundary'),
      '私密结果'
    );
    assertNoPrivateAdminUsersText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffItemValue(
  view: AdminUsersHandoffView,
  id: AdminUsersHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing admin users handoff item ${id}`);
  return item.value;
}

function assertNoPrivateAdminUsersText(serializedView: string) {
  for (const privateValue of [
    SECRET_EMAIL,
    SECRET_SEARCH_TEXT,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Admin users handoff leaked private text: ${privateValue}`
    );
  }
}
