import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve(import.meta.dirname, '../dist');
const built = fs.existsSync(path.join(dist, 'index.html'));
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

test('plain Astro uses shared discovery defaults without site-owned feeds', { skip: !built }, () => {
  const html = read('index.html');
  const robots = read('robots.txt');
  const sitemap = read('sitemap-index.xml');

  assert.doesNotMatch(html, /application\/rss\+xml|\/rss(?:\.xml|\.zh-CN\.xml)/u);
  assert.match(robots, /User-agent: \*\nAllow: \//u);
  assert.match(robots, /Sitemap: https:\/\/tasks\.hagicode\.com\/sitemap-index\.xml/u);
  assert.match(sitemap, /https:\/\/tasks\.hagicode\.com\/sitemap-\d+\.xml/u);
  assert.equal(fs.existsSync(path.join(dist, 'rss.xml')), false);
  assert.equal(fs.existsSync(path.join(dist, 'rss.zh-CN.xml')), false);
});
