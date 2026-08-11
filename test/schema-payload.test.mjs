import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EXPECTED_SCHEMA_PATHS,
  resolveSchemaSourceDir,
  stageSchemas,
  verifySchemaPayload,
} from '../scripts/schema-payload.mjs';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

function makeWorkspace() {
  const root = mkdtempSync(join(tmpdir(), 'hagitask-schemas-'));
  const sourceDir = join(root, 'source', 'schemas');
  const distDir = join(root, 'dist');
  mkdirSync(distDir, { recursive: true });
  for (const rel of EXPECTED_SCHEMA_PATHS) {
    const full = join(sourceDir, ...rel.split('/'));
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, JSON.stringify({ $id: rel }));
  }
  return { root, sourceDir, distDir, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('the expected payload covers the two community schemas and seven package schemas', () => {
  const packageSchemas = EXPECTED_SCHEMA_PATHS.filter((p) => p.startsWith('task-preset-plugin/'));
  assert.equal(EXPECTED_SCHEMA_PATHS.length, 9);
  assert.equal(packageSchemas.length, 7);
  assert.ok(EXPECTED_SCHEMA_PATHS.includes('community-index-v1.schema.json'));
  assert.ok(EXPECTED_SCHEMA_PATHS.includes('community-task-detail-v1.schema.json'));
});

test('staging preserves the task-preset-plugin subdirectory structure', () => {
  const ws = makeWorkspace();
  try {
    const target = stageSchemas(ws.sourceDir, ws.distDir);
    assert.equal(target, join(ws.distDir, 'schemas'));
    for (const rel of EXPECTED_SCHEMA_PATHS) {
      assert.ok(existsSync(join(target, ...rel.split('/'))), `missing staged schema ${rel}`);
    }
    assert.deepEqual(verifySchemaPayload(ws.distDir), []);
  } finally {
    ws.cleanup();
  }
});

test('staging fails when the schema source directory is absent', () => {
  const ws = makeWorkspace();
  try {
    assert.throws(() => stageSchemas(join(ws.root, 'missing', 'schemas'), ws.distDir), /schema source not found/);
  } finally {
    ws.cleanup();
  }
});

test('verification reports a missing schema', () => {
  const ws = makeWorkspace();
  try {
    stageSchemas(ws.sourceDir, ws.distDir);
    rmSync(join(ws.distDir, 'schemas', 'task-preset-plugin', 'manifest.schema.json'));
    assert.deepEqual(verifySchemaPayload(ws.distDir), [
      'dist/schemas/task-preset-plugin/manifest.schema.json is missing',
    ]);
  } finally {
    ws.cleanup();
  }
});

test('verification reports a malformed schema', () => {
  const ws = makeWorkspace();
  try {
    stageSchemas(ws.sourceDir, ws.distDir);
    writeFileSync(join(ws.distDir, 'schemas', 'community-index-v1.schema.json'), '{ not json');
    const errors = verifySchemaPayload(ws.distDir);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^dist\/schemas\/community-index-v1\.schema\.json is not parseable JSON/);
  } finally {
    ws.cleanup();
  }
});

test('verification reports an unstaged payload', () => {
  const ws = makeWorkspace();
  try {
    assert.deepEqual(verifySchemaPayload(ws.distDir), [
      'dist/schemas/ is missing. Stage the HagiTask schemas before verification.',
    ]);
  } finally {
    ws.cleanup();
  }
});

test('the nested HagiTask checkout provides every expected schema', { skip: !existsSync(resolveSchemaSourceDir({})) }, () => {
  const sourceDir = resolveSchemaSourceDir({});
  const ws = makeWorkspace();
  try {
    stageSchemas(sourceDir, ws.distDir);
    assert.deepEqual(verifySchemaPayload(ws.distDir), []);
  } finally {
    ws.cleanup();
  }
});

test('the site does not vendor a second schema copy', () => {
  assert.ok(!existsSync(join(REPO_ROOT, 'src', 'lib', 'schemas')));
});
