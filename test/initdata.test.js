import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

// Synthetic (non-real) bot token for tests, set BEFORE importing lib/validate
// (which reads BOT_TOKEN at load). This is NOT a BotFather credential.
const TEST_TOKEN = '999999:SYNTHETIC_TEST_BOT_TOKEN_NOT_REAL';
process.env.BOT_TOKEN = TEST_TOKEN;
const { validateInitData } = await import('../lib/validate.js');

// Sign initData the way Telegram signs it for BOT-TOKEN validation: the
// data_check_string is every field EXCEPT `hash`, sorted, joined by \n. A
// present `signature` field is KEPT in the HMAC input (only the third-party
// Ed25519 check excludes it), so a fixture carrying `signature` proves that
// stripping it would break validation. This exclude-`hash`-only rule was
// verified externally against the canonical @telegram-apps/init-data-node
// vector (excluding only `hash` reproduces Telegram's hash).
function signInitData(fields, token = TEST_TOKEN) {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

const freshAuthDate = () => String(Math.floor(Date.now() / 1000));

test('validateInitData accepts initData carrying a signature field (signature stays in the HMAC)', () => {
  const initData = signInitData({
    auth_date: freshAuthDate(),
    query_id: 'AAExampleQueryId',
    user: JSON.stringify({ id: 42, first_name: 'Test' }),
    signature: 'ed25519_placeholder_signature_value',
  });
  const out = validateInitData(initData);
  assert.ok(out, 'signature-carrying initData must validate; stripping signature would break this');
  assert.equal(out.user.id, 42);
});

test('validateInitData accepts initData without a signature field', () => {
  const initData = signInitData({ auth_date: freshAuthDate(), user: JSON.stringify({ id: 7 }) });
  const out = validateInitData(initData);
  assert.ok(out);
  assert.equal(out.user.id, 7);
});

test('validateInitData rejects a tampered hash', () => {
  const initData = `auth_date=${freshAuthDate()}&user=%7B%22id%22%3A1%7D&hash=deadbeef`;
  assert.equal(validateInitData(initData), null);
});

test('validateInitData rejects a hash signed with a different token', () => {
  const initData = signInitData({ auth_date: freshAuthDate(), user: JSON.stringify({ id: 5 }) }, '111111:A_DIFFERENT_TOKEN');
  assert.equal(validateInitData(initData), null, 'a hash from another bot token must be rejected');
});

test('validateInitData rejects expired initData (replay window enforced under the normal TTL)', () => {
  const stale = signInitData({
    // 24h old, well past the 900s default INIT_DATA_MAX_AGE_SECONDS.
    auth_date: String(Math.floor(Date.now() / 1000) - 24 * 3600),
    user: JSON.stringify({ id: 9 }),
  });
  assert.equal(validateInitData(stale), null, 'stale auth_date must be rejected');
});
