/**
 * Pre-build step: materialize deterministic community package archives into
 * public/packages/ and validate the catalog against the v1 schemas.
 *
 * Runs automatically before `astro build` (npm "prebuild" hook). Uses Node's
 * built-in type stripping to load the TypeScript catalog loader.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const { getCatalog, buildPackageBuffer, PACKAGES_DIR } = await import(
  '../src/lib/community-index.ts'
);

const catalog = getCatalog();

mkdirSync(PACKAGES_DIR, { recursive: true });
for (const detail of catalog.details) {
  const buf = buildPackageBuffer(detail.taskId);
  writeFileSync(join(PACKAGES_DIR, `${detail.taskId}.zip`), buf);
}

console.log(
  `community: generated ${catalog.details.length} packages and validated ${catalog.index.tasks.length} index entries`,
);
