import { execFileSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'lamp-poc');
execFileSync('composer', ['validate', '--strict', '--no-check-all'], { cwd, stdio: 'inherit' });
execFileSync('composer', ['install', '--no-interaction', '--prefer-dist'], { cwd, stdio: 'inherit' });
execFileSync('php', ['-l', 'public/index.php'], { cwd, stdio: 'inherit' });

const env = {
  ...process.env,
  EC_DSN: process.env.EC_DSN || 'mysql:host=127.0.0.1;port=3306;dbname=electrocraft',
  EC_DB_USER: process.env.EC_DB_USER || 'electrocraft',
  EC_DB_PASSWORD: process.env.EC_DB_PASSWORD || 'electrocraft',
};
const server = spawn('php', ['-S', '127.0.0.1:8099', '-t', 'public', 'public/index.php'], { cwd, env, stdio: 'inherit' });
try {
  await delay(1200);
  const get = await fetch('http://127.0.0.1:8099/appointments');
  if (!get.ok) throw new Error(`GET failed ${get.status}: ${await get.text()}`);

  const csrfRes = await fetch('http://127.0.0.1:8099/csrf');
  if (!csrfRes.ok) throw new Error(`CSRF GET failed ${csrfRes.status}`);
  const cookie = csrfRes.headers.get('set-cookie')?.split(';')[0] || '';
  const csrf = await csrfRes.json();
  const body = new URLSearchParams({ clientName: 'Ada Lovelace', startsAt: '2026-08-18 14:30:00', status: 'pending', csrf_name: csrf.csrf_name, csrf_value: csrf.csrf_value });
  const post = await fetch('http://127.0.0.1:8099/appointments', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie }, body });
  if (post.status !== 201) throw new Error(`POST failed ${post.status}: ${await post.text()}`);

  const bad = await fetch('http://127.0.0.1:8099/appointments', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie }, body: new URLSearchParams({ clientName: 'Mallory', startsAt: '2026-08-18 15:00:00' }) });
  if (bad.status < 400) throw new Error('CSRF negative test unexpectedly passed');
  console.log('PASS_REAL_LAMP Slim route/PDO/CSRF runtime');
} finally {
  server.kill('SIGTERM');
}
