import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, 'src', file), 'utf8');

test('BaseLayout mounts one shared header and footer with preference allowlists', () => {
  const layout = read('layouts/BaseLayout.astro');
  assert.match(layout, /<Header \/>/);
  assert.match(layout, /<Footer \/>/);
  assert.match(layout, /hagitask-locale/);
  assert.match(layout, /hagitask-theme/);
  assert.match(layout, /value === 'en-US' \|\| value === 'zh-CN'/);
  assert.match(layout, /value === 'dark' \|\| value === 'light'/);
});

test('Header exposes accessible desktop and mobile controls', () => {
  const header = read('components/Header.astro');
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-controls="mobile-navigation"/);
  assert.match(header, /data-theme-toggle/);
  assert.match(header, /data-locale-toggle="en-US"/);
  assert.match(header, /rel="noopener noreferrer"/);
});

test('Footer contains grouped information architecture and safe external links', () => {
  const footer = read('components/Footer.astro');
  assert.match(footer, /Product/);
  assert.match(footer, /Resources/);
  assert.match(footer, /Community/);
  assert.match(footer, /noopener noreferrer/);
});

test('PromoteCard is optional, bilingual, dismissible, and safe', () => {
  const card = read('components/PromoteCard.astro');
  const loader = read('lib/promote-loader.ts');
  assert.match(card, /loadFirstActivePromotion/);
  assert.match(loader, /index-catalog/);
  assert.match(card, /data-promote-close/);
  assert.match(card, /noopener noreferrer/);
});

test('external navigation uses one validated warning route', () => {
  const layout = read('layouts/BaseLayout.astro');
  const links = read('lib/external-links.ts');
  const warning = read('pages/external-link-warning.astro');
  assert.match(layout, /createWarningUrl/);
  assert.match(layout, /resolveExternalLink/);
  assert.match(links, /http:/);
  assert.match(links, /https:/);
  assert.match(links, /warning\.searchParams\.set\('url'/);
  assert.match(links, /url\.origin !==/);
  assert.match(warning, /Invalid destination/);
  assert.match(warning, /window\.history\.back/);
  assert.match(warning, /noopener,noreferrer/);
});

test('task cards and detail pages expose one navigable command catalog', () => {
  const card = read('components/TaskCard.astro');
  const detail = read('pages/tasks/[taskId]/index.astro');
  const index = read('lib/community-index.ts');
  assert.match(card, /<a class="task-card" href=\{`\/tasks\/\$\{task\.taskId\}\/`\}/);
  assert.doesNotMatch(card, /<a class="task-card__link"/);
  assert.match(detail, /command-nav/);
  assert.match(detail, /id=\{command\.anchor\}/);
  assert.match(detail, /storePageContent/);
  assert.match(detail, /presentation\.commands\.length > 0/);
  assert.match(index, /interface TaskPresentation/);
  assert.match(index, /return \{ commands, prompts, storePages/);
});
