// Leonida Ledger — hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// What this program does, in plain terms: it takes the guide that lives in
// this repository — the static app/ folder and the screenshots/ folder — and
// lays them out in the hand-in directory, then asks the vendored make.fun
// library to write the dossier.json the judge reads. Nothing is built,
// bundled or fetched: the app is plain files, and the dossier is computed
// from those files alone, so running this twice writes identical bytes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The grader runs this in a fresh container with a read-only repository and
// a writable /output, 10 seconds, no network. It runs it twice and both
// runs must write the same bytes — so there is no timestamp, no random
// value and no directory-listing order dependence anywhere below: cpSync
// copies in a stable order and buildDossier sorts what it reads.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader hands us /output; a local run uses MAKEFUN_OUTPUT_DIR.
const handInDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// Refuse to hand in a broken entry rather than write a bad dossier: the
// app must exist with an index.html, and there must be 3 or 4 screenshots.
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith('.'))
  .filter((name) => statSync(join(shotsDir, name)).isFile());
if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}`);

mkdirSync(handInDir, { recursive: true });
cpSync(appDir, join(handInDir, 'app'), { recursive: true });
mkdirSync(join(handInDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(handInDir, 'screenshots'), { recursive: true });

// The scorer's own caps for this bounty (reference/gate.json): the text
// cap shapes the dossier's bytes; the others refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB, more than
// 993 files and directories in app/ or 48 MiB of app files. app/ counts
// beside /output's own 1,000-entry cap, its screenshots/ and dossier.json.
const dossier = buildDossier(handInDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(handInDir, 'dossier.json'), dossier);

console.log(`handed in ${shots.length} screenshots (${shots.sort().join(', ')}) to ${handInDir}`);
