import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidCommitSha, parseCommunityCommit, resolveSyncAction } from '../scripts/community-commit.mjs';

const VALID = '270e5d7ee74fbabf25ae0437f6f1daa1f9bc4648';
const OTHER = 'abcdef0123456789abcdef0123456789abcdef01';

test('isValidCommitSha accepts a 40-char lowercase hex SHA', () => {
  assert.equal(isValidCommitSha(VALID), true);
});

test('isValidCommitSha rejects uppercase, short, and non-hex values', () => {
  assert.equal(isValidCommitSha(VALID.toUpperCase()), false);
  assert.equal(isValidCommitSha(VALID.slice(0, 39)), false);
  assert.equal(isValidCommitSha('g'.repeat(40)), false);
  assert.equal(isValidCommitSha(''), false);
  assert.equal(isValidCommitSha(42), false);
});

test('parseCommunityCommit returns the trimmed SHA for a valid single line', () => {
  const { commit, origin } = parseCommunityCommit(`${VALID}\n`, { origin: 'community-packages.commit' });
  assert.equal(commit, VALID);
  assert.equal(origin, 'community-packages.commit');
});

test('parseCommunityCommit rejects multi-line content', () => {
  assert.throws(
    () => parseCommunityCommit(`${VALID}\n${OTHER}\n`),
    /exactly one line/,
  );
});

test('parseCommunityCommit rejects a malformed SHA', () => {
  assert.throws(
    () => parseCommunityCommit('not-a-sha'),
    /40-character lowercase hex SHA/,
  );
});

test('resolveSyncAction returns noop when source matches recorded', () => {
  assert.equal(resolveSyncAction(VALID, VALID), 'noop');
});

test('resolveSyncAction returns deploy when source differs from recorded', () => {
  assert.equal(resolveSyncAction(OTHER, VALID), 'deploy');
});

test('resolveSyncAction treats an empty recorded commit as a deploy', () => {
  assert.equal(resolveSyncAction(VALID, ''), 'deploy');
  assert.equal(resolveSyncAction(VALID, null), 'deploy');
});

test('resolveSyncAction throws on an invalid source commit', () => {
  assert.throws(() => resolveSyncAction('nope', VALID), /source commit is not a valid/);
});

test('resolveSyncAction throws on an invalid recorded commit', () => {
  assert.throws(() => resolveSyncAction(VALID, 'nope'), /recorded commit is not a valid/);
});
