/**
 * Starts the Firebase emulators with their working directory pointed at
 * node_modules/.cache — NOT the project root.
 *
 * Why: firebase-tools writes firebase-debug.log / firestore-debug.log /
 * ui-debug.log into its cwd. When those land in the project root on Windows,
 * the Angular compiler's directory scan stats them and dies with
 * `TS500 ... EPERM` the moment a log enters the "delete pending" state
 * (deleted while the emulator still holds it open). Keeping the logs inside
 * node_modules — which TypeScript never scans — makes the whole failure mode
 * impossible.
 *
 * Data import/export still uses ./emulator-data in the project root.
 *
 * --export-on-exit only fires on a graceful shutdown, which Windows rarely
 * delivers (closed terminal, killed task, Ctrl+C not reaching the Java
 * engines) — that silently threw away every edit made during the session.
 * So this wrapper also snapshots the running emulators into ./emulator-data
 * every 2 minutes: feed the data once and every later start re-imports the
 * latest snapshot no matter how the previous session ended.
 */

import { execFile, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logDir = resolve(root, 'node_modules', '.cache', 'firebase-emulators');
mkdirSync(logDir, { recursive: true });

const dataDir = resolve(root, 'emulator-data');
const project = 'my-portfolio-in-angular';

const child = spawn(
  'firebase',
  [
    'emulators:start',
    '--project',
    project,
    '--config',
    resolve(root, 'firebase.json'),
    '--import',
    dataDir,
    '--export-on-exit',
    dataDir,
  ],
  { cwd: logDir, stdio: 'inherit', shell: true },
);

const EXPORT_EVERY_MS = 2 * 60 * 1000;
let exporting = false;

const autoExport = setInterval(() => {
  if (exporting) return;
  exporting = true;
  execFile(
    'firebase',
    ['emulators:export', dataDir, '--force', '--project', project],
    { cwd: logDir, shell: true },
    (err) => {
      exporting = false;
      if (!err) {
        console.log(
          `[emulators] data auto-saved to ./emulator-data (${new Date().toLocaleTimeString()})`,
        );
      }
      // Errors are expected while the hub is still booting — stay quiet and
      // let the next tick retry.
    },
  );
}, EXPORT_EVERY_MS);

child.on('exit', (code) => {
  clearInterval(autoExport);
  process.exit(code ?? 0);
});
