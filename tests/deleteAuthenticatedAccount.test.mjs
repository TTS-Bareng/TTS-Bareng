import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deleteAuthenticatedAccount, isDeletingRemoteAccount } from '../src/lib/deleteAuthenticatedAccount.ts';

const session = (apple = true, id = 'user-id') => ({ access_token: 'caller-token', user: { id, identities: apple ? [{ provider: 'apple', identity_data: { sub: 'apple-sub' } }] : [{ provider: 'email' }] } });

test('Apple deletion reauthenticates without switching the Supabase account', async () => {
  const calls = [];
  await deleteAuthenticatedAccount('user-id', {
    getSession: async () => { calls.push('session'); return session(); },
    authorizeApple: async subject => { assert.equal(subject, 'apple-sub'); assert.equal(isDeletingRemoteAccount(), true); calls.push('apple'); return 'fresh-code'; },
    removeAccount: async (token, code) => { calls.push('remove'); assert.equal(token, 'caller-token'); assert.equal(code, 'fresh-code'); },
  });
  assert.deepEqual(calls, ['session', 'apple', 'session', 'remove']);
  assert.equal(isDeletingRemoteAccount(), false);
});

test('non-Apple deletion does not request Apple authorization', async () => {
  await deleteAuthenticatedAccount('user-id', { getSession: async () => session(false), authorizeApple: async () => assert.fail('Apple should not open'), removeAccount: async (_token, code) => assert.equal(code, undefined) });
});

test('missing session, a different account, or account switching during Apple prompt cannot delete', async () => {
  for (const value of [null, session(true, 'other-user')]) {
    await assert.rejects(() => deleteAuthenticatedAccount('user-id', { getSession: async () => value, authorizeApple: async () => assert.fail(), removeAccount: async () => assert.fail() }));
  }
  let reads = 0;
  await assert.rejects(() => deleteAuthenticatedAccount('user-id', { getSession: async () => session(true, ++reads === 1 ? 'user-id' : 'other-user'), authorizeApple: async () => 'fresh-code', removeAccount: async () => assert.fail('session changed') }));
});

test('cancelled Apple authorization or failed server deletion propagates and releases in-flight guard', async () => {
  await assert.rejects(() => deleteAuthenticatedAccount('user-id', { getSession: async () => session(), authorizeApple: async () => { throw new Error('cancelled'); }, removeAccount: async () => assert.fail() }), /cancelled/);
  assert.equal(isDeletingRemoteAccount(), false);
  await assert.rejects(() => deleteAuthenticatedAccount('user-id', { getSession: async () => session(false), authorizeApple: async () => assert.fail(), removeAccount: async () => { throw new Error('offline'); } }), /offline/);
  assert.equal(isDeletingRemoteAccount(), false);
});

test('parallel deletion cannot consume the same Apple authorization twice', async () => {
  let finish;
  const first = deleteAuthenticatedAccount('user-id', { getSession: async () => session(false), authorizeApple: async () => assert.fail(), removeAccount: () => new Promise(resolve => { finish = resolve; }) });
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(() => deleteAuthenticatedAccount('user-id', { getSession: async () => assert.fail(), authorizeApple: async () => assert.fail(), removeAccount: async () => assert.fail() }));
  finish();
  await first;
});
