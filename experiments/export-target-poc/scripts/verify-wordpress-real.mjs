import { execFileSync } from 'node:child_process';

const run = (args, options = {}) => execFileSync('npx', ['wp-env', ...args], { stdio: 'inherit', ...options });
const capture = (args) => execFileSync('npx', ['wp-env', ...args], { encoding: 'utf8' });
const lines = (text) => text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);

run(['start', '--update']);
try {
  const themeNames = lines(capture(['run', 'cli', 'wp', 'theme', 'list', '--field=name']));
  const theme = themeNames.find((name) => name.includes('wordpress-theme-poc') || name.includes('electrocraft-poc'));
  if (!theme) throw new Error(`Generated theme not recognized: ${themeNames.join(', ')}`);
  run(['run', 'cli', 'wp', 'theme', 'activate', theme]);

  const pluginNames = lines(capture(['run', 'cli', 'wp', 'plugin', 'list', '--field=name']));
  const plugin = pluginNames.find((name) => name.includes('wordpress-plugin-poc') || name.includes('electrocraft-companion'));
  if (!plugin) throw new Error(`Generated plugin not recognized: ${pluginNames.join(', ')}`);
  run(['run', 'cli', 'wp', 'plugin', 'activate', plugin]);

  const version = capture(['run', 'cli', 'wp', 'option', 'get', 'electrocraft_poc_schema_version']);
  if (!version.includes('0.0.1')) throw new Error('Activation migration option missing');
  const types = capture(['run', 'cli', 'wp', 'post-type', 'list', '--field=name']);
  if (!types.includes('appointment')) throw new Error('Appointment CPT missing');

  const response = await fetch('http://127.0.0.1:8888/wp-json/electrocraft/v1/appointments');
  if (response.status !== 401 && response.status !== 403) throw new Error(`Protected REST route expected 401/403, got ${response.status}`);
  const html = await (await fetch('http://127.0.0.1:8888/')).text();
  if (!html.includes('Citas')) throw new Error('Block theme smoke did not render Citas');
  console.log(`PASS_REAL_WORDPRESS theme=${theme} plugin=${plugin} CPT + protected REST route`);
} finally {
  try { run(['stop']); } catch {}
}
