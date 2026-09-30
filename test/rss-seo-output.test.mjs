import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve(import.meta.dirname, '../dist');
const built = fs.existsSync(path.join(dist, 'index.html'));
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');
const count = (value, pattern) => [...value.matchAll(pattern)].length;

test('built feed uses catalog content and absolute task pages without publication dates', { skip: !built }, () => {
  const feed = read('rss.xml');
  const englishAlias = read('rss.en.xml');
  const chineseFeed = read('rss.zh-CN.xml');
  const catalog = JSON.parse(read('index.json'));
  const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => item);
  const englishAliasItems = [...englishAlias.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => item);
  const chineseItems = [...chineseFeed.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => item);
  const links = items.map((item) => item.match(/<link>([^<]+)<\/link>/u)?.[1]);
  const chineseLinks = chineseItems.map((item) => item.match(/<link>([^<]+)<\/link>/u)?.[1]);

  assert.match(feed, /^<\?xml version="1\.0" encoding="UTF-8"\?><rss\b/u);
  assert.match(feed, /<language>en-US<\/language>/u);
  assert.match(chineseFeed, /<language>zh-CN<\/language>/u);
  assert.match(feed, /<channel>[\s\S]*<\/channel><\/rss>$/u);
  assert.equal(items.length, catalog.tasks.length);
  assert.deepEqual(englishAliasItems.map((item) => item.match(/<link>([^<]+)<\/link>/u)?.[1]), links);
  assert.equal(chineseItems.length, catalog.tasks.length);
  assert.deepEqual(
    links.map((link) => new URL(link).pathname),
    catalog.tasks.map((task) => `/tasks/${task.taskId}/`),
  );
  assert.deepEqual(
    chineseLinks.map((link) => new URL(link).pathname),
    catalog.tasks.map((task) => `/tasks/${task.taskId}/`),
  );
  assert.ok(links.every((link) => new URL(link).origin === 'https://tasks.hagicode.com'));
  assert.ok(chineseLinks.every((link) => new URL(link).origin === 'https://tasks.hagicode.com'));
  assert.doesNotMatch(feed, /<pubDate>/u);
  assert.doesNotMatch(chineseFeed, /<pubDate>/u);
});

test('built HTML has one live shared shell and route-specific metadata', { skip: !built }, () => {
  const catalog = read('index.html');
  const chineseFooter = catalog.match(/<template id="footer-zh-template">([\s\S]*?)<\/template>/u)?.[1] ?? '';
  const task = read('tasks/goal/index.html');
  const sitemap = read('sitemap-0.xml');

  for (const [html, canonical, description] of [
    [catalog, 'https://tasks.hagicode.com/', 'Browse reusable HagiCode community tasks, workflows, and integrations.'],
    [task, 'https://tasks.hagicode.com/tasks/goal/', null],
  ]) {
    const liveHtml = html.replace(/<template\b[\s\S]*?<\/template>/gu, '');
    const footer = liveHtml.match(/<footer\b[\s\S]*?<\/footer>/u)?.[0] ?? '';
    assert.equal(count(liveHtml, /<footer\b/gu), 1);
    assert.equal(count(liveHtml, /<hagilight-promoto-banner\b/gu), 1);
    assert.doesNotMatch(liveHtml, /promote-card/u);
    assert.equal(count(html, /rel="canonical"/gu), 1);
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}"`));
    assert.equal(count(html, /name="description"/gu), 1);
    assert.equal(count(html, /property="og:title"/gu), 1);
    assert.equal(count(html, /property="og:description"/gu), 1);
    assert.equal(count(html, /name="twitter:title"/gu), 1);
    assert.equal(count(html, /name="twitter:description"/gu), 1);
    assert.equal(count(html, /hreflang=/gu), 0);
    assert.match(html, /<link rel="alternate" type="application\/rss\+xml" title="HagiTask RSS" href="\/rss\.xml"/u);
    assert.match(footer, /<h2[^>]*>Quick Links<\/h2>/u);
    assert.match(footer, /<h2[^>]*>Community<\/h2>/u);
    assert.match(footer, /href="\/rss\.xml"[^>]*>RSS Feed</u);
    for (const [, anchor] of footer.matchAll(/<a\b[^>]*>/gu)) {
      if (/href="https?:\/\//u.test(anchor)) {
        assert.match(anchor, /target="_blank"/u);
        assert.match(anchor, /rel="noopener noreferrer"/u);
      }
    }
    assert.match(html, /闽ICP备2026004153号-1/u);
    assert.match(html, /闽公网安备35011102351148号/u);
    if (description) assert.match(html, new RegExp(`name="description" content="${description}"`));
  }

  assert.match(task, /content="Goal · HagiTask"/u);
  assert.match(chineseFooter, /href="\/rss\.zh-CN\.xml"[^>]*>当前语言 RSS</u);
  assert.match(sitemap, /https:\/\/tasks\.hagicode\.com\/tasks\/goal\//u);
  assert.doesNotMatch(sitemap, /external-link-warning|\.json|\.xml/u);
});

test('warning page is noindex and not included in the sitemap', { skip: !built }, () => {
  const warning = read('external-link-warning/index.html');
  const sitemap = read('sitemap-0.xml');
  assert.match(warning, /<meta name="robots" content="noindex, nofollow"/u);
  assert.doesNotMatch(sitemap, /external-link-warning/u);
});
