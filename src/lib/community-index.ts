/**
 * Community catalog loader, normalizer, validator, and package builder.
 *
 * Reads the `community-packages/` Git submodule (repos/hagitask-community-packages),
 * normalizes each task from `community-packages/data/<taskId>/` into the v1 model,
 * validates the emitted documents against the authoritative v1 schemas loaded from
 * the nested HagiTask submodule at `community-packages/hagitask/schemas/`, computes
 * deterministic package archives + SHA-256 digests, and minifies every JSON document
 * before publication.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { assertValid } from './jsonSchema';
import { createZip, type ZipEntry } from './zip';

// Paths are resolved from the project root. Both `astro build` and the prebuild
// script run with the site repository as the current working directory. The site
// mounts the Community repository as `community-packages/`, task packages live under
// `community-packages/data/`, and the authoritative publication schemas are loaded
// from the nested HagiTask submodule at `community-packages/hagitask/schemas/`.
// (import.meta.url is not used because the build bundles this module into dist/.prerender/.)
const ROOT = process.cwd();
const COMMUNITY_ROOT = join(ROOT, 'community-packages');
const DATA_DIR = join(COMMUNITY_ROOT, 'data');
const SCHEMA_DIR = join(COMMUNITY_ROOT, 'hagitask', 'schemas');
const PUBLIC_PACKAGES_DIR = join(ROOT, 'public', 'packages');

function loadSchema(fileName: string): any {
  const full = join(SCHEMA_DIR, fileName);
  if (!existsSync(full)) {
    throw new Error(
      `Community publication schema not found at ${full}. ` +
        `Initialize nested submodules with \`git submodule update --init --recursive\` before building.`,
    );
  }
  return JSON.parse(readFileSync(full, 'utf8'));
}

const indexSchema = loadSchema('community-index-v1.schema.json');
const detailSchema = loadSchema('community-task-detail-v1.schema.json');

export const PUBLISHER = 'HagiCode';
export const SOURCE_ROOT = 'https://github.com/HagiCode-org/hagitask-community-packages';

export interface Requirement {
  type: string;
  name: string;
  command?: string;
  args?: string[];
}

export interface Compatibility {
  agent: string;
  skills: string[];
  cli: Array<{ name: string; command?: string; args?: string[] }>;
}

export interface NormalizedTask {
  taskId: string;
  name: Record<string, string>;
  summary: Record<string, string>;
  category: string;
  tags: string[];
  publisher: string;
  source: string;
  version: string;
  compatibility: Compatibility;
  requirements: Requirement[];
}

export interface IndexEntry {
  taskId: string;
  name: Record<string, string>;
  summary: Record<string, string>;
  category: string;
  tags: string[];
  publisher: string;
  source: string;
  version: string;
  publishedAt: string;
  detailUrl: string;
  packageUrl: string;
  compatibility: Compatibility;
  integrity: { algorithm: 'sha256'; sha256: string };
}

export interface DetailDoc {
  schemaVersion: 1;
  taskId: string;
  version: string;
  publisher: string;
  source: string;
  publishedAt: string;
  generatedAt: string;
  name: Record<string, string>;
  summary: Record<string, string>;
  description: Record<string, string>;
  category: string;
  tags: string[];
  compatibility: Compatibility;
  requirements: Requirement[];
  resources: {
    manifest: string;
    backend: string;
    frontend: string;
    prompts: string;
    locales: string[];
    storePage: string[];
  };
  installation: {
    packageUrl: string;
    mediaType: 'application/zip';
    size: number;
    sha256: string;
    algorithm: 'sha256';
  };
  documentation: {
    storePage: Record<string, string>;
    external?: Array<{ label: string; url: string }>;
  };
  localization: {
    defaultLocale: string;
    supportedLocales: string[];
  };
  metadata: Record<string, unknown>;
}

export interface IndexDoc {
  schemaVersion: 1;
  generatedAt: string;
  publisher: string;
  source: string;
  tasks: IndexEntry[];
}

export interface Catalog {
  generatedAt: string;
  tasks: NormalizedTask[];
  index: IndexDoc;
  details: DetailDoc[];
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

/**
 * Minimal YAML frontmatter parser covering scalar values and block sequences
 * (`key:\n  - item`), which is all the store-page documents use.
 */
function parseFrontmatter(md: string): Record<string, unknown> {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const result: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let list: string[] | null = null;

  const flush = () => {
    if (currentKey && list) result[currentKey] = list;
    list = null;
  };

  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      const val = line.replace(/^\s*-\s+/, '').trim().replace(/^['"]|['"]$/g, '');
      if (!list) list = [];
      list.push(val);
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      flush();
      const key = kv[1];
      const raw = kv[2].trim().replace(/^['"]|['"]$/g, '');
      currentKey = key;
      if (raw === '') {
        list = null; // expecting a block sequence on following lines
      } else {
        result[key] = raw;
        list = null;
      }
    }
  }
  flush();
  return result;
}

function walkFiles(dir: string, base: string, out: ZipEntry[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walkFiles(full, rel, out);
    } else if (entry.isFile()) {
      out.push({ name: rel, data: readFileSync(full) });
    }
  }
}

export function buildPackageBuffer(taskId: string): Buffer {
  const taskDir = join(DATA_DIR, taskId);
  const entries: ZipEntry[] = [];
  walkFiles(taskDir, '', entries);
  return createZip(entries);
}

export function sha256Hex(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

/** Serialize a document with no presentation whitespace (publication minification). */
export function minify(doc: unknown): string {
  return JSON.stringify(doc);
}

export function listTaskIds(): string[] {
  if (!existsSync(DATA_DIR) || !statSync(DATA_DIR).isDirectory()) {
    throw new Error(
      `Community data not found at ${DATA_DIR}. Initialize the \`community-packages\` submodule and its nested submodules with \`git submodule update --init --recursive\` before building.`,
    );
  }
  return readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(DATA_DIR, e.name, 'manifest.json')))
    .map((e) => e.name)
    .sort();
}

function normalizeTask(taskId: string): NormalizedTask {
  const taskDir = join(DATA_DIR, taskId);
  const manifest = readJson(join(taskDir, 'manifest.json'));
  const preset = readJson(join(taskDir, 'backend', 'task-preset.json'));

  const name: Record<string, string> = {};
  const summary: Record<string, string> = {};
  const storePages: Record<string, Record<string, unknown>> = {};
  for (const file of readdirSync(join(taskDir, 'store-page'))) {
    const m = file.match(/^index\.([a-zA-Z-]+)\.md$/);
    if (!m) continue;
    const locale = m[1];
    const fm = parseFrontmatter(readText(join(taskDir, 'store-page', file)));
    storePages[locale] = fm;
    if (typeof fm.title === 'string') name[locale] = fm.title;
    if (typeof fm.summary === 'string') summary[locale] = fm.summary;
  }

  const catalog = (storePages['en-US']?.catalog as string[] | undefined) ?? [];
  const tags = (storePages['en-US']?.tags as string[] | undefined) ?? [];
  const category = catalog[0] ?? tags[0] ?? 'General';
  const allTags = Array.from(new Set([...catalog, ...tags]));

  const rawRequirements: Requirement[] = (preset.requirements ?? []).map((r: any) => {
    const req: Requirement = { type: r.type, name: r.name };
    if (r.command) req.command = r.command;
    if (Array.isArray(r.args)) req.args = r.args;
    return req;
  });

  const compatibility: Compatibility = {
    agent: rawRequirements.find((r) => r.type === 'agent')?.name ?? 'any',
    skills: rawRequirements.filter((r) => r.type === 'skills').map((r) => r.name),
    cli: rawRequirements
      .filter((r) => r.type === 'cli')
      .map((r) => {
        const c: { name: string; command?: string; args?: string[] } = { name: r.name };
        if (r.command) c.command = r.command;
        if (r.args) c.args = r.args;
        return c;
      }),
  };

  return {
    taskId,
    name,
    summary,
    category,
    tags: allTags,
    publisher: manifest.owner ?? PUBLISHER,
    source: SOURCE_ROOT,
    version: manifest.version,
    compatibility,
    requirements: rawRequirements,
  };
}

function buildDetailDoc(task: NormalizedTask, generatedAt: string): DetailDoc {
  const pkg = buildPackageBuffer(task.taskId);
  const digest = sha256Hex(pkg);
  const supportedLocales = Object.keys(task.name).sort();
  const defaultLocale = supportedLocales.includes('en-US') ? 'en-US' : supportedLocales[0] ?? 'en-US';

  const storePageDocs: Record<string, string> = {};
  for (const locale of supportedLocales) {
    storePageDocs[locale] = `/tasks/${task.taskId}/`;
  }

  return {
    schemaVersion: 1,
    taskId: task.taskId,
    version: task.version,
    publisher: task.publisher,
    source: task.source,
    publishedAt: generatedAt,
    generatedAt,
    name: task.name,
    summary: task.summary,
    description: task.summary,
    category: task.category,
    tags: task.tags,
    compatibility: task.compatibility,
    requirements: task.requirements,
    resources: {
      manifest: 'manifest.json',
      backend: 'backend/',
      frontend: 'frontend/',
      prompts: 'backend/prompts.json',
      locales: ['locales/en-US.json', 'locales/zh-CN.json'],
      storePage: ['store-page/index.en-US.md', 'store-page/index.zh-CN.md'],
    },
    installation: {
      packageUrl: `/packages/${task.taskId}.zip`,
      mediaType: 'application/zip',
      size: pkg.length,
      sha256: digest,
      algorithm: 'sha256',
    },
    documentation: {
      storePage: storePageDocs,
      external: [
        {
          label: 'Source store page',
          url: `${SOURCE_ROOT}/blob/main/data/${task.taskId}/store-page/index.en-US.md`,
        },
      ],
    },
    localization: {
      defaultLocale,
      supportedLocales,
    },
    metadata: {
      owner: task.publisher,
    },
  };
}

export function buildIndexDoc(tasks: NormalizedTask[], details: DetailDoc[], generatedAt: string): IndexDoc {
  const entries: IndexEntry[] = tasks.map((task, i) => {
    const detail = details[i];
    return {
      taskId: task.taskId,
      name: task.name,
      summary: task.summary,
      category: task.category,
      tags: task.tags,
      publisher: task.publisher,
      source: task.source,
      version: task.version,
      publishedAt: generatedAt,
      detailUrl: `/tasks/${task.taskId}.json`,
      packageUrl: `/packages/${task.taskId}.zip`,
      compatibility: task.compatibility,
      integrity: {
        algorithm: 'sha256',
        sha256: detail.installation.sha256,
      },
    };
  });
  return {
    schemaVersion: 1,
    generatedAt,
    publisher: PUBLISHER,
    source: SOURCE_ROOT,
    tasks: entries,
  };
}

export function getCatalog(): Catalog {
  const generatedAt = new Date().toISOString();
  const ids = listTaskIds();
  if (ids.length === 0) {
    throw new Error('No community tasks found under community-packages/data.');
  }

  const seen = new Set<string>();
  const tasks: NormalizedTask[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate taskId detected: ${id}`);
    }
    seen.add(id);
    tasks.push(normalizeTask(id));
  }

  const details = tasks.map((t) => buildDetailDoc(t, generatedAt));
  const index = buildIndexDoc(tasks, details, generatedAt);

  // Schema conformance: invalid source data must fail the build.
  assertValid(index, indexSchema, '/index.json');
  details.forEach((d) => assertValid(d, detailSchema, `/tasks/${d.taskId}.json`));

  return { generatedAt, tasks, index, details };
}

export const PACKAGES_DIR = PUBLIC_PACKAGES_DIR;