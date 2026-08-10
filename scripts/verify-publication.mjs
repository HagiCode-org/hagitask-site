/**
 * Build-time / post-build publication verification.
 *
 * Parses the published minified /index.json and asserts:
 *  - every referenced detail document exists and parses
 *  - every referenced package archive exists
 *  - the archive SHA-256 matches the index and detail digests
 *  - every published JSON document is minified (no formatting whitespace)
 *  - detailUrl / packageUrl resolve within the publication payload
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

if (!existsSync(DIST)) {
  fail(`dist/ not found at ${DIST}. Run \`npm run build\` first.`);
  process.exit(1);
}

const indexPath = join(DIST, 'index.json');
if (!existsSync(indexPath)) {
  fail('dist/index.json is missing.');
  process.exit(1);
}

const indexRaw = readFileSync(indexPath, 'utf8');
if (/\n/.test(indexRaw) || /  /.test(indexRaw)) {
  fail('dist/index.json is not minified.');
} else {
  ok('dist/index.json is minified');
}

const index = JSON.parse(indexRaw);
if (index.schemaVersion !== 1) fail('index.schemaVersion is not 1');
else ok('index.schemaVersion is 1');

const ids = new Set();
for (const entry of index.tasks) {
  if (ids.has(entry.taskId)) fail(`Duplicate taskId in index: ${entry.taskId}`);
  ids.add(entry.taskId);

  // URL stability
  const expectedDetail = `/tasks/${entry.taskId}.json`;
  const expectedPkg = `/packages/${entry.taskId}.zip`;
  if (entry.detailUrl !== expectedDetail) fail(`${entry.taskId}: detailUrl ${entry.detailUrl} != ${expectedDetail}`);
  if (entry.packageUrl !== expectedPkg) fail(`${entry.taskId}: packageUrl ${entry.packageUrl} != ${expectedPkg}`);

  // detail exists
  const detailPath = join(DIST, entry.detailUrl);
  if (!existsSync(detailPath)) {
    fail(`${entry.taskId}: detail document missing at ${entry.detailUrl}`);
    continue;
  }
  const detailRaw = readFileSync(detailPath, 'utf8');
  if (/\n/.test(detailRaw) || /  /.test(detailRaw)) {
    fail(`${entry.taskId}: detail document is not minified.`);
  }
  const detail = JSON.parse(detailRaw);
  if (detail.taskId !== entry.taskId) fail(`${entry.taskId}: detail.taskId mismatch`);

  // archive exists + hash matches
  const pkgPath = join(DIST, entry.packageUrl);
  if (!existsSync(pkgPath)) {
    fail(`${entry.taskId}: package archive missing at ${entry.packageUrl}`);
  } else {
    const buf = readFileSync(pkgPath);
    const digest = createHash('sha256').update(buf).digest('hex');
    if (digest !== entry.integrity.sha256) {
      fail(`${entry.taskId}: index integrity sha256 mismatch (${digest} != ${entry.integrity.sha256})`);
    }
    if (digest !== detail.installation.sha256) {
      fail(`${entry.taskId}: detail installation sha256 mismatch`);
    }
    if (detail.installation.size !== buf.length) {
      fail(`${entry.taskId}: detail installation.size mismatch`);
    }
  }
}

// Canonical id coverage: the six shipped community tasks must be present and the
// human-facing aliases must never be emitted as protocol ids.
const EXPECTED_IDS = [
  'ui-master',
  'claude-md-update',
  'last30days',
  'ponytail',
  'goal',
  'openspec-spec-compress',
];
const ALIASES = ['agentsmd', 'portytail'];
for (const id of EXPECTED_IDS) {
  if (!ids.has(id)) fail(`Canonical task id missing from index: ${id}`);
  else ok(`index includes canonical task ${id}`);
}
for (const alias of ALIASES) {
  if (ids.has(alias)) fail(`Alias '${alias}' must not be emitted as a task id`);
}

// The site must not vendor its own schema copy; it loads the publication schemas
// from the nested hagitask submodule (community-packages/hagitask/schemas).
if (existsSync(join(REPO_ROOT, 'src', 'lib', 'schemas'))) {
  fail('Site still vendors publication schemas at src/lib/schemas; load them from the nested hagitask submodule.');
} else {
  ok('Site loads publication schemas from the nested hagitask submodule (no duplicated copy)');
}

// no stray packages without index entries
const pkgDir = join(DIST, 'packages');
if (existsSync(pkgDir)) {
  for (const f of readdirSync(pkgDir)) {
    const id = f.replace(/\.zip$/, '');
    if (!ids.has(id)) fail(`Orphan package archive without index entry: ${f}`);
  }
}

if (process.exitCode === 1) {
  console.error('\nPublication verification FAILED.');
  process.exit(1);
}
console.log(`\nPublication verification passed for ${index.tasks.length} tasks.`);