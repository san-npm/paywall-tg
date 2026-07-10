import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

// Set a deterministic bot token BEFORE importing lib/validate (which reads it at load).
process.env.BOT_TOKEN = '123456:TEST_BOT_TOKEN_FOR_INITDATA_VALIDATION';
const { validateInitData } = await import('../lib/validate.js');

// Build a validly-signed initData string the way Telegram does: the data_check_string
// excludes BOTH hash and signature, sorted alphabetically, joined by line feeds.
function signInitData(fields, token) {
  const params = new URLSearchParams(fields);
  const pairs = [...params.entries()]
    .filter(([k]) => k !== 'hash' && k !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

test('validateInitData accepts initData that carries a signature field', () => {
  const token = process.env.BOT_TOKEN;
  const initData = signInitData({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: 'AAExampleQueryId',
    user: JSON.stringify({ id: 42, first_name: 'Test' }),
    // Modern Telegram clients include this Ed25519 signature; it must NOT enter
    // the bot-token data_check_string. Regression guard for the signature-strip fix.
    signature: 'ed25519_placeholder_signature_value',
  }, token);

  const out = validateInitData(initData);
  assert.ok(out, 'initData containing a signature field must validate');
  assert.equal(out.user.id, 42);
});

test('validateInitData still accepts initData without a signature field', () => {
  const token = process.env.BOT_TOKEN;
  const initData = signInitData({
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: 7 }),
  }, token);

  const out = validateInitData(initData);
  assert.ok(out, 'legacy initData without a signature field must still validate');
  assert.equal(out.user.id, 7);
});

test('validateInitData rejects a tampered hash', () => {
  const initData = `auth_date=${Math.floor(Date.now() / 1000)}&user=%7B%22id%22%3A1%7D&hash=deadbeef`;
  assert.equal(validateInitData(initData), null);
});

test('validateInitData rejects expired initData', () => {
  const token = process.env.BOT_TOKEN;
  const stale = signInitData({
    auth_date: String(Math.floor(Date.now() / 1000) - 100000),
    user: JSON.stringify({ id: 9 }),
  }, token);
  assert.equal(validateInitData(stale), null, 'stale auth_date must be rejected');
});
