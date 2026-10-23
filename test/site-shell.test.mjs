import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, 'src', file), 'utf8');

test('BaseLayout mounts one shared footer and promotion banner with synchronized preferences', () => {
  const layout = read('layouts/BaseLayout.astro');
  assert.match(layout, /<Header \/>/);
  assert.match(layout, /<Footer locale="en-US" \/>/);
  assert.match(layout, /<template id="footer-zh-template"><Footer locale="zh-CN" \/>/);
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
  assert.match(header, /href="https:\/\/github\.com\/HagiCode-org\/hagitask" target="_blank" rel="noopener"/);
  assert.doesNotMatch(header, /noreferrer/);
});

test('first-party classification follows the shared link policy by parsed host', async () => {
  const { isFirstPartyUrl } = await import('../src/lib/external-links.ts');
  const firstParty = [
    'https://docs.hagicode.com/blog/',
    'https://hagicode.com/',
    'https://WWW.HagiCode.com/en-US/desktop/',
    'https://github.com/HagiCode-org/site/issues',
    'https://github.com/hagicode-org/hagitask',
  ];
  const thirdParty = [
    'https://hagicode.com.evil.example/',
    'https://nothagicode.com/',
    'https://example.com/hagicode.com',
    'https://github.com/HagiCode-org-fake/site',
    'https://discord.gg/qY662sJK',
    'https://apps.microsoft.com/detail/9N3PM0N3SVDW',
  ];
  for (const href of firstParty) assert.equal(isFirstPartyUrl(new URL(href)), true, href);
  for (const href of thirdParty) assert.equal(isFirstPartyUrl(new URL(href)), false, href);
});

test('shared footer uses Hagilight default links without a site-specific link configuration', () => {
  const layout = read('layouts/BaseLayout.astro');
  assert.match(layout, /import Footer from '@hagicode\/hagilight-core\/Footer'/);
  assert.match(layout, /<Footer locale="en-US" \/>/);
  assert.match(layout, /<Footer locale="zh-CN" \/>/);
  assert.doesNotMatch(layout, /extraLinks|overrides|removeLinks|<Footer[^>]*siteId/);
  assert.equal(fs.existsSync(path.join(root, 'src/config/hagilight-footer.ts')), false);
});

test('homepage uses the shared promotion only and old local mounts are removed', () => {
  const layout = read('layouts/BaseLayout.astro');
  const home = read('pages/index.astro');
  assert.match(layout, /@hagicode\/hagilight-core\/PromotoBanner/);
  assert.doesNotMatch(home, /PromoteCard/);
  assert.equal(fs.existsSync(path.join(root, 'src/components/PromoteCard.astro')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/lib/promote-loader.ts')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/components/Footer.astro')), false);
});

test('HTML layout uses shared SEO without site-specific RSS configuration', () => {
  const layout = read('layouts/BaseLayout.astro');
  const detail = read('pages/tasks/[taskId]/index.astro');
  const config = read('../astro.config.mjs');
  assert.match(layout, /@hagicode\/hagilight\/SEOHead/);
  assert.match(layout, /page=\{\{ url: canonicalUrl, title, description \}\}/);
  assert.doesNotMatch(layout, /application\/rss\+xml|rssFeedUrl|rssLocaleFeedUrl/);
  assert.match(layout, /canonicalUrl/);
  assert.doesNotMatch(layout, /hreflang/);
  assert.match(detail, /description=\{detail\.description\['en-US'\]/);
  assert.match(config, /hagilight\(\s*\{/);
  assert.match(config, /rss:\s*\{/);
  assert.doesNotMatch(config, /hagilightRss|rss-feed|sitemap\(\s*\{/);
  assert.equal(fs.existsSync(path.join(root, 'src/pages/rss.xml.ts')), false);
  assert.equal(fs.existsSync(path.join(root, 'src/pages/rss.zh-CN.xml.ts')), false);
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
  assert.match(warning, /isFirstPartyUrl\(resolved\.url\) \? 'noopener' : 'noopener,noreferrer'/);
  assert.match(warning, /define:vars=\{\{ target, opener \}\}/);
  assert.match(warning, /window\.open\(target, '_blank', opener\)/);
  assert.doesNotMatch(warning, /window\.open\(target, '_blank', 'noopener,noreferrer'\)/);
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
