import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deleteRemoteAccount } from '../src/lib/deleteRemoteAccount.ts';

test('guest can clear local data without a server session', async () => {
  let called = false;
  await deleteRemoteAccount(true, async () => { called = true; return null; }, async () => { called = true; });
  assert.equal(called, false);
});

test('signed-in account is deleted remotely before local cleanup', async () => {
  const calls = [];
  await deleteRemoteAccount(false, async () => { calls.push('session'); return 'user-id'; }, async () => { calls.push('delete'); }, 'user-id');
  assert.deepEqual(calls, ['session', 'delete']);
});

test('missing session or server failure prevents successful deletion', async () => {
  await assert.rejects(() => deleteRemoteAccount(false, async () => null, async () => assert.fail('unexpected delete'), 'user-id'));
  await assert.rejects(() => deleteRemoteAccount(false, async () => 'other-user', async () => assert.fail('unexpected delete'), 'user-id'));
  await assert.rejects(() => deleteRemoteAccount(false, async () => 'user-id', async () => { throw new Error('offline'); }, 'user-id'));
});
