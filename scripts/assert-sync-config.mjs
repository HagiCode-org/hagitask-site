/**
 * Static assertions for the Community synchronization workflow.
 *
 * Verifies that `.github/workflows/sync-community-content.yml` and
 * `.github/workflows/deploy-gh-pages.yml` are configured the way the
 * synchronization model requires:
 *   - the sync workflow runs on schedule + manual dispatch, with `contents: write`
 *     (to commit the state file) and `actions: write` (to trigger the deploy),
 *     serialized concurrency, no self-recursive `push` trigger, and a non-force
 *     state-commit guard;
 *   - the deploy workflow accepts an optional `community_commit` input and ignores
 *     `community-packages.commit` on push so recording state never republishes;
 *   - `community-packages.commit` exists and is exactly one valid 40-char SHA;
 *   - the site no longer depends on a `community-packages` Git submodule.
 *
 * Run both locally and as the first step of the sync workflow so a configuration
 * drift fails loudly before any git push.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCommunityCommit } from './community-commit.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const syncWorkflowPath = join(repoRoot, '.github', 'workflows', 'sync-community-content.yml');
const deployWorkflowPath = join(repoRoot, '.github', 'workflows', 'deploy-gh-pages.yml');
const gitmodulesPath = join(repoRoot, '.gitmodules');
const commitStatePath = join(repoRoot, 'community-packages.commit');

const problems = [];
function check(condition, message) {
  if (!condition) problems.push(message);
}

// --- Sync workflow ---------------------------------------------------------
if (!existsSync(syncWorkflowPath)) {
  problems.push(`Sync workflow not found at ${syncWorkflowPath}`);
} else {
  const wf = readFileSync(syncWorkflowPath, 'utf8');
  check(/^\s*schedule:\s*$/m.test(wf), 'sync workflow must declare a `schedule:` trigger');
  check(/cron:\s*["']/m.test(wf), 'sync workflow schedule must include a `cron:` entry');
  check(/^\s*workflow_dispatch:\s*(#.*)?$/m.test(wf), 'sync workflow must allow `workflow_dispatch:`');
  check(/contents:\s*write/m.test(wf), 'sync workflow must request `contents: write` (to commit state)');
  check(/actions:\s*write/m.test(wf), 'sync workflow must request `actions: write` (to trigger deploy)');
  check(/^\s*concurrency:\s*$/m.test(wf), 'sync workflow must declare `concurrency:`');
  check(/group:\s*\S+/m.test(wf), 'sync workflow concurrency must define a `group:`');
  // Recursion guard: the sync workflow must not trigger on push, or it would loop on its own commit.
  check(!/^\s*push:\s*$/m.test(wf), 'sync workflow must NOT trigger on `push:` (would recurse)');
  // It must reference the deploy workflow it triggers and the state file it writes.
  check(/deploy-gh-pages\.yml/m.test(wf), 'sync workflow must trigger `deploy-gh-pages.yml`');
  check(/community-packages\.commit/m.test(wf), 'sync workflow must operate on `community-packages.commit`');
}

// --- Deploy workflow -------------------------------------------------------
if (!existsSync(deployWorkflowPath)) {
  problems.push(`Deploy workflow not found at ${deployWorkflowPath}`);
} else {
  const wf = readFileSync(deployWorkflowPath, 'utf8');
  check(/community_commit:/m.test(wf), 'deploy workflow must accept a `community_commit` input');
  // Recursion guard: a state-only push must not re-trigger the deploy.
  check(
    /paths-ignore:\s*\n(?:\s*-\s*\S+\n)*\s*-\s*community-packages\.commit/m.test(wf),
    'deploy workflow push trigger must `paths-ignore` community-packages.commit (avoid recursion)',
  );
  check(
    !/submodules:\s*recursive/m.test(wf),
    'deploy workflow must NOT use `submodules: recursive` (build reads a dynamic checkout)',
  );
  check(
    /HAGITASK_COMMUNITY_SOURCE_DIR/m.test(wf),
    'deploy workflow must set HAGITASK_COMMUNITY_SOURCE_DIR for the dynamic Community checkout',
  );
}

// --- Submodule removal -----------------------------------------------------
if (!existsSync(gitmodulesPath)) {
  // No .gitmodules at all is acceptable: there is definitely no community-packages submodule.
} else {
  const gm = readFileSync(gitmodulesPath, 'utf8');
  check(
    !/\[submodule\s+"community-packages"\]/m.test(gm),
    '.gitmodules must NOT declare the `community-packages` submodule',
  );
  check(
    !/path\s*=\s*community-packages/m.test(gm),
    '.gitmodules must NOT map `path = community-packages`',
  );
}

// --- State file ------------------------------------------------------------
if (!existsSync(commitStatePath)) {
  problems.push(`community-packages.commit not found at ${commitStatePath}`);
} else {
  try {
    parseCommunityCommit(readFileSync(commitStatePath, 'utf8'));
  } catch (e) {
    problems.push(`community-packages.commit is invalid: ${e.message}`);
  }
}

if (problems.length > 0) {
  console.error('✗ Sync configuration assertions failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('✓ Sync workflow configuration assertions passed.');
