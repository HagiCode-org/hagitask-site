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
