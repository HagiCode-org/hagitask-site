/**
 * Community commit state helpers.
 *
 * The site records the Community commit it last successfully published in
 * `community-packages.commit` as exactly one 40-character lowercase hex SHA.
 * These helpers validate that state and decide whether a sync must trigger a
 * deployment, so the same logic is shared by the sync workflow assertions and
 * the unit tests.
 */
const COMMIT_SHA_RE = /^[0-9a-f]{40}$/;

/**
 * True when `value` is exactly a 40-character lowercase hexadecimal SHA-1.
 */
export function isValidCommitSha(value) {
  return typeof value === 'string' && COMMIT_SHA_RE.test(value);
}

/**
 * Parse the single-line commit state file.
 * @param {string} text raw file contents
 * @param {{ origin?: string }} [opts]
 * @returns {{ commit: string, origin: string }} the validated commit
 * @throws when the file is missing, multi-line, or not a valid SHA
 */
export function parseCommunityCommit(text, { origin = 'community-packages.commit' } = {}) {
  if (typeof text !== 'string') {
    throw new Error(`${origin} is missing or not a string.`);
  }
  const candidate = text.trim();
  if (candidate.split(/\r?\n/).length !== 1) {
    throw new Error(`${origin} must contain exactly one line (the Community commit SHA).`);
  }
  if (!isValidCommitSha(candidate)) {
    throw new Error(`${origin} must contain exactly one 40-character lowercase hex SHA.`);
  }
  return { commit: candidate, origin };
}

/**
 * Decide the synchronization action for a discovered Community `main` commit
 * against the recorded commit.
 * @returns {'noop' | 'deploy'}
 * @throws when `sourceCommit` (or a non-empty `recordedCommit`) is not a valid SHA
 */
export function resolveSyncAction(sourceCommit, recordedCommit) {
  if (!isValidCommitSha(sourceCommit)) {
    throw new Error('source commit is not a valid 40-character lowercase SHA.');
  }
  if (recordedCommit != null && recordedCommit !== '' && !isValidCommitSha(recordedCommit)) {
    throw new Error('recorded commit is not a valid 40-character lowercase SHA.');
  }
  if (recordedCommit === sourceCommit) return 'noop';
  return 'deploy';
}
