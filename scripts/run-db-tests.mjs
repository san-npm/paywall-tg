import { spawn } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const databasePath = join(tmpdir(), `gategram-db-tests-${process.pid}.db`);
const env = {
  ...process.env,
  TURSO_DATABASE_URL: `file:${databasePath}`,
  TURSO_AUTH_TOKEN: '',
};

const tests = spawn('node', [
  '--test',
  '--test-concurrency=1',
  'test/delivery-queue.test.js',
  'test/rate-limit.test.js',
  'test/purchase-refund.test.js',
  'test/analytics-channels.test.js',
  'test/payout-policy.test.js',
], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
});

const exitCode = await new Promise((resolve) => {
  tests.once('exit', (code) => resolve(code ?? 1));
});

await unlink(databasePath).catch(() => {});
process.exitCode = exitCode;
