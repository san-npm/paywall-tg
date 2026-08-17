import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = 4124;
const base = `http://127.0.0.1:${port}`;
const databasePath = join(tmpdir(), `gategram-integration-${process.pid}.db`);
const env = {
  ...process.env,
  TEST_PORT: String(port),
  WEBHOOK_SECRET: 'test_secret',
  BOT_TOKEN: 'test_token',
  TURSO_DATABASE_URL: `file:${databasePath}`,
  TURSO_AUTH_TOKEN: '',
};

function waitForServer(timeoutMs = 45_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const response = await fetch(`${base}/api/products`);
        if (response.status > 0) return resolve();
      } catch {}
      if (Date.now() - started >= timeoutMs) {
        return reject(new Error('Timed out waiting for the integration test server'));
      }
      setTimeout(check, 300);
    };
    check();
  });
}

const server = spawn('npm', ['run', 'dev', '--', '-p', String(port)], {
  cwd: process.cwd(),
  env,
  stdio: ['ignore', 'inherit', 'inherit'],
});

let exitCode = 1;
try {
  await waitForServer();
  const tests = spawn('node', [
    '--test',
    '--test-concurrency=1',
    'test/webhook.test.js',
    'test/products-api.test.js',
  ], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  });
  exitCode = await new Promise((resolve) => tests.once('exit', (code) => resolve(code ?? 1)));
} finally {
  server.kill('SIGTERM');
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3_000);
    server.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

process.exitCode = exitCode;
