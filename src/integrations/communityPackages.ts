/**
 * Astro integration: materialize deterministic community package archives into
 * the build output under `packages/` during `astro:build:done`.
 *
 * This avoids a separate prebuild step / external TS runner. The archives are
 * byte-stable (fixed timestamps), so their SHA-256 matches what the JSON routes
 * advertise and what the publication verifier checks.
 */
import type { AstroIntegration } from 'astro';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { getCatalog, buildPackageBuffer } from '../lib/community-index';

export function communityPackages(): AstroIntegration {
  return {
    name: 'community-packages',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const { details } = getCatalog();
        const outDir = fileURLToPath(dir);
        const pkgDir = join(outDir, 'packages');
        mkdirSync(pkgDir, { recursive: true });
        for (const detail of details) {
          const buf = buildPackageBuffer(detail.taskId);
          writeFileSync(join(pkgDir, `${detail.taskId}.zip`), buf);
        }
        console.log(
          `community: materialized ${details.length} package archives into ${pkgDir}`,
        );
      },
    },
  };
}
