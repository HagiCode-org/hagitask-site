/**
 * HagiTask schema publication payload.
 *
 * The authoritative schemas live in the HagiTask repository. The deploy workflow
 * clones that repository into a runner temporary directory and points
 * `HAGITASK_SCHEMA_SOURCE_DIR` at its `schemas/` directory; locally the source
 * defaults to the nested `community-packages/hagitask/schemas/` checkout that the
 * build already validates against. The site never vendors its own schema copy.
 *
 * Staging copies the source tree verbatim to `dist/schemas/`, so every file is
 * published at `https://tasks.hagicode.com/schemas/<source-relative-path>` — the
 * same path tail community packages use in their `$schema` references.
 */
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_DIST_DIR = join(REPO_ROOT, 'dist');
const DEFAULT_SOURCE_DIR = join(REPO_ROOT, 'community-packages', 'hagitask', 'schemas');

/** Every schema that must be reachable under `/schemas/` after publication. */
export const EXPECTED_SCHEMA_PATHS = [
  'community-index-v1.schema.json',
  'community-task-detail-v1.schema.json',
  'task-preset-plugin/commands.schema.json',
  'task-preset-plugin/locales.schema.json',
  'task-preset-plugin/manifest.schema.json',
  'task-preset-plugin/panel.schema.json',
  'task-preset-plugin/prompt-package.schema.json',
  'task-preset-plugin/store-page-frontmatter.schema.json',
  'task-preset-plugin/task-preset.schema.json',
];

export function resolveSchemaSourceDir(env = process.env) {
  return resolve(env.HAGITASK_SCHEMA_SOURCE_DIR || DEFAULT_SOURCE_DIR);
}

/**
 * Copy the authoritative schema tree into `<distDir>/schemas/`.
 * Throws when the source tree or the build output is absent.
 * @returns {string} the staged directory
 */
export function stageSchemas(sourceDir, distDir) {
  if (!existsSync(sourceDir)) {
    throw new Error(
      `HagiTask schema source not found at ${sourceDir}. ` +
        `Set HAGITASK_SCHEMA_SOURCE_DIR to a HagiTask checkout's schemas/ directory, ` +
        `or run \`git submodule update --init --recursive\` to populate the nested checkout.`,
    );
  }
  if (!existsSync(distDir)) {
    throw new Error(`Build output not found at ${distDir}. Run \`npm run build\` first.`);
  }
  const target = join(distDir, 'schemas');
  rmSync(target, { recursive: true, force: true });
  cpSync(sourceDir, target, { recursive: true });
  return target;
}

/**
 * Check that every expected schema is published and parseable.
 * @returns {string[]} human-readable errors, empty when the payload is valid
 */
export function verifySchemaPayload(distDir) {
  const root = join(distDir, 'schemas');
  if (!existsSync(root)) {
    return ['dist/schemas/ is missing. Stage the HagiTask schemas before verification.'];
  }
  const errors = [];
  for (const rel of EXPECTED_SCHEMA_PATHS) {
    const full = join(root, ...rel.split('/'));
    if (!existsSync(full)) {
      errors.push(`dist/schemas/${rel} is missing`);
      continue;
    }
    try {
      JSON.parse(readFileSync(full, 'utf8'));
    } catch (e) {
      errors.push(`dist/schemas/${rel} is not parseable JSON: ${e.message}`);
    }
  }
  return errors;
}

function main() {
  const sourceDir = resolveSchemaSourceDir();
  const target = stageSchemas(sourceDir, DEFAULT_DIST_DIR);
  console.log(`✓ Staged ${EXPECTED_SCHEMA_PATHS.length} HagiTask schemas from ${sourceDir} to ${target}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
