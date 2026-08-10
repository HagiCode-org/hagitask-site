/**
 * Static assertions for the Community synchronization workflow.
 *
 * Verifies that `.github/workflows/sync-community-content.yml` is configured the way
 * the synchronization model requires (scheduled + manual trigger, write permission,
 * serialized concurrency, and no self-recursive `push` trigger) and that the expected
 * `data` submodule points at the Community repository. Run both locally and as the first
 * step of the sync workflow so a configuration drift fails loudly before any git push.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = join(repoRoot, '.github', 'workflows', 'sync-community-content.yml');
const gitmodulesPath = join(repoRoot, '.gitmodules');

const problems = [];
function check(condition, message) {
  if (!condition) problems.push(message);
}

if (!existsSync(workflowPath)) {
  problems.push(`Sync workflow not found at ${workflowPath}`);
} else {
  const wf = readFileSync(workflowPath, 'utf8');
  check(/^\s*schedule:\s*$/m.test(wf), 'workflow must declare a `schedule:` trigger');
  check(/cron:\s*["']/m.test(wf), 'workflow schedule must include a `cron:` entry');
  check(/^\s*workflow_dispatch:\s*(#.*)?$/m.test(wf), 'workflow must allow `workflow_dispatch:`');
  check(/contents:\s*write/m.test(wf), 'workflow must request `contents: write`');
  check(/^\s*concurrency:\s*$/m.test(wf), 'workflow must declare `concurrency:`');
  check(/group:\s*\S+/m.test(wf), 'workflow concurrency must define a `group:`');
  // Recursion guard: the sync workflow must not trigger on push, or it would loop on its own commit.
  check(!/^\s*push:\s*$/m.test(wf), 'sync workflow must NOT trigger on `push:` (would recurse)');
  // It must reference the submodule path it is allowed to move.
  check(/SUBMODULE_PATH:\s*["']data["']/m.test(wf), 'workflow must operate on the `data` submodule path');
}

if (!existsSync(gitmodulesPath)) {
  problems.push(`.gitmodules not found at ${gitmodulesPath}`);
} else {
  const gm = readFileSync(gitmodulesPath, 'utf8');
  check(/\[submodule\s+"data"\]/m.test(gm), '.gitmodules must declare the `data` submodule');
  check(/path\s*=\s*data/m.test(gm), '.gitmodules `data` submodule must have `path = data`');
  check(
    /url\s*=\s*https:\/\/github\.com\/HagiCode-org\/hagitask-community-packages\.git/m.test(gm),
    '.gitmodules `data` submodule must point at the Community repository',
  );
}

if (problems.length > 0) {
  console.error('✗ Sync configuration assertions failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('✓ Sync workflow configuration assertions passed.');
