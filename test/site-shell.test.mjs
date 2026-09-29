import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, 'src', file), 'utf8');

test('BaseLayout mounts one shared footer and promotion banner with synchronized preferences', () => {
  const layout = read('layouts/BaseLayout.astro');
  assert.match(layout, /<Header \/>/);
  assert.match(layout, /<Footer locale="en-US" links=\{\{ rssFeedUrl: '\/rss\.xml' \}\} \/>/);
  assert.match(layout, /<template id="footer-zh-template"><Footer locale="zh-CN" links=\{\{ rssFeedUrl: '\/rss\.xml', rssLocaleFeedUrl: '\/rss\.zh-CN\.xml' \}\} \/>/);
  assert.match(layout, /<PromotoBanner locale="en-US" \/>/);
  assert.match(layout, /hagitask-locale/);
  assert.match(layout, /hagitask-theme/);
  assert.match(layout, /value === 'en-US' \|\| value === 'zh-CN'/);
  assert.match(layout, /value === 'dark' \|\| value === 'light'/);
  assert.match(layout, /footer\.innerHTML = locale === 'zh-CN' \? chineseFooter : englishFooter/);
  assert.match(layout, /banner\.dataset\.locale = locale/);
  assert.match(layout, /new Event\('astro:page-load'\)/);
});

test('Header exposes accessible desktop and mobile controls', () => {
  const header = read('components/Header.astro');
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-controls="mobile-navigation"/);
  assert.match(header, /data-theme-toggle/);
  assert.match(header, /data-locale-toggle="en-US"/);
  assert.match(header, /rel="noopener noreferrer"/);
});

test('shared footer uses Hagilight default links without a site-specific link configuration', () => {
  const layout = read('layouts/BaseLayout.astro');
  assert.match(layout, /import Footer from '@hagicode\/hagilight\/Footer'/);
  assert.match(layout, /links=\{\{ rssFeedUrl: '\/rss\.xml' \}\}/);
  assert.match(layout, /locale="zh-CN" links=\{\{ rssFeedUrl: '\/rss\.xml', rssLocaleFeedUrl: '\/rss\.zh-CN\.xml' \}\}/);
  assert.doesNotMatch(layout, /extraLinks|overrides|removeLinks|siteId/);
  assert.equal(fs.existsSync(path.join(root, 'src/config/hagilight-footer.ts')), false);
});

test('homepage uses the shared promotion only and old local mounts are removed', () => {
  const layout = read('layouts/BaseLayout.astro');
  const home = read('pages/index.astro');
  assert.match(layout, /@hagicode\/hagilight\/PromotoBanner/);
  assert.doesNotMatch(home, /PromoteCard/);
  assert.equal(fs.existsSync(path.join(root, 'src/components/PromoteCard.astro')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/lib/promote-loader.ts')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/components/Footer.astro')), false);
});

test('HTML layout emits RSS discovery and route-specific SEO without locale alternates', () => {
  const layout = read('layouts/BaseLayout.astro');
  const detail = read('pages/tasks/[taskId]/index.astro');
  const feed = read('pages/rss.xml.ts');
  const chineseFeed = read('pages/rss.zh-CN.xml.ts');
  assert.match(layout, /@hagicode\/hagilight\/SEOHead/);
  assert.match(layout, /name: 'description'/);
  assert.match(layout, /rel="alternate" type="application\/rss\+xml"[^>]+href="\/rss\.xml"/);
  assert.match(layout, /canonicalUrl/);
  assert.doesNotMatch(layout, /hreflang/);
  assert.match(detail, /description=\{detail\.description\['en-US'\]/);
  assert.match(feed, /generateRssFeed/);
  assert.match(feed, /link: `\/tasks\/\$\{task\.taskId\}\/`/);
  assert.doesNotMatch(feed, /pubDate/);
  assert.match(chineseFeed, /language: 'zh-CN'/);
  assert.match(chineseFeed, /task\.name\['zh-CN'\]/);
  assert.match(chineseFeed, /task\.summary\['zh-CN'\]/);
  assert.doesNotMatch(chineseFeed, /pubDate/);
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
  assert.match(detail, /stripFrontmatter\(source\)/);
  assert.match(detail, /presentation\.commands\.length > 0/);
  assert.doesNotMatch(detail, /<span>\{command\.group\}<\/span>/);
  assert.match(detail, /command\.group\['en-US'\]/);
  assert.match(detail, /data-tab="storepage"/);
  assert.match(detail, /data-tab="metadata"/);
  assert.match(detail, /data-tab="commands"/);
  assert.match(detail, /grid-template-areas: 'nav list'/);
  assert.match(detail, /panel\.hidden = panel\.dataset\.tabPanel !== selected/);
  assert.match(index, /interface TaskPresentation/);
  assert.match(index, /return \{ commands, prompts, storePages/);
});
