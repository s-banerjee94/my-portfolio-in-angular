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
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logDir = resolve(root, 'node_modules', '.cache', 'firebase-emulators');
mkdirSync(logDir, { recursive: true });

const dataDir = resolve(root, 'emulator-data');

const child = spawn(
  'firebase',
  [
    'emulators:start',
    '--project',
    'my-portfolio-in-angular',
    '--config',
    resolve(root, 'firebase.json'),
    '--import',
    dataDir,
    '--export-on-exit',
    dataDir,
  ],
  { cwd: logDir, stdio: 'inherit', shell: true },
);

child.on('exit', (code) => process.exit(code ?? 0));
