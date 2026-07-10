import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

// Real Telegram-signed initData vector (canonical @telegram-apps/init-data-node
// fixture). It carries BOTH an Ed25519 `signature` field and the bot-token
// `hash`. The bot-token HMAC is computed over every field except `hash`, so
// `signature` is PART of the HMAC input and must be kept. This vector is the
// authoritative guard: stripping `signature` makes it fail to validate.
const REAL_TOKEN = '7342037359:AAFZehRPBRs8Seg40oDjTMIW8uTGPuW1zfQ';
const REAL_INIT_DATA = 'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=8134722200314281151&chat_type=private&auth_date=1733584787&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6';

// Configure BEFORE importing lib/validate (config reads env at load): the real
// token so the HMAC matches, and a large max-age so the 2024 vector is not
// rejected as expired.
process.env.BOT_TOKEN = REAL_TOKEN;
process.env.INIT_DATA_MAX_AGE_SECONDS = '100000000000';
const { validateInitData } = await import('../lib/validate.js');

// Sign initData the way Telegram does for bot-token validation: exclude ONLY
// `hash` from the data_check_string (a `signature` field, if present, is kept).
function signInitData(fields, token) {
  const params = new URLSearchParams(fields);
  const pairs = [...params.entries()]
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

test('validateInitData accepts a real Telegram initData that carries a signature field', () => {
  const out = validateInitData(REAL_INIT_DATA);
  assert.ok(out, 'real signature-carrying initData must validate (signature is part of the bot-token HMAC)');
  assert.equal(out.user.id, 279058397);
});

test('validateInitData accepts freshly-signed initData containing a signature field', () => {
  const initData = signInitData({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: 'AAExampleQueryId',
    user: JSON.stringify({ id: 42, first_name: 'Test' }),
    signature: 'ed25519_placeholder_signature_value',
  }, REAL_TOKEN);
  const out = validateInitData(initData);
  assert.ok(out, 'signature-carrying initData must validate');
  assert.equal(out.user.id, 42);
});

test('validateInitData accepts initData without a signature field', () => {
  const initData = signInitData({
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: 7 }),
  }, REAL_TOKEN);
  const out = validateInitData(initData);
  assert.ok(out, 'legacy initData without a signature field must still validate');
  assert.equal(out.user.id, 7);
});

test('validateInitData rejects a tampered hash', () => {
  const initData = `auth_date=${Math.floor(Date.now() / 1000)}&user=%7B%22id%22%3A1%7D&hash=deadbeef`;
  assert.equal(validateInitData(initData), null);
});
