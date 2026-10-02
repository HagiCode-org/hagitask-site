import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve(import.meta.dirname, '../dist');
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');

function assertEmptyFeed(xml, language) {
  assert.match(xml, /^<\?xml/u);
  const channel = xml.match(/<channel>([\s\S]*?)<\/channel>/u)?.[1];
  assert.ok(channel, 'RSS feed has a channel');
  assert.match(channel, /<title>[^<]+<\/title>/u);
  assert.match(channel, /<description>[^<]+<\/description>/u);
  assert.match(channel, new RegExp(`<language>${language}</language>`, 'u'));
  assert.match(channel, /<link>https:\/\/tasks\.hagicode\.com\/<\/link>/u);
  assert.doesNotMatch(xml, /<item>/u);
}

test('plain Astro publishes empty default, English alias, and Chinese feeds', () => {
  const html = read('index.html');
  const robots = read('robots.txt');
  const sitemap = read('sitemap-index.xml');
  const defaultFeed = read('rss.xml');
  const englishAlias = read('rss.en.xml');
  const chineseFeed = read('rss.zh-CN.xml');

  assertEmptyFeed(defaultFeed, 'en');
  assertEmptyFeed(englishAlias, 'en');
  assertEmptyFeed(chineseFeed, 'zh-CN');
  assert.equal(defaultFeed, englishAlias);
  assert.match(html, /<footer\b[^>]*hagilight-footer/u);
  assert.ok(html.includes('https://tasks.hagicode.com/rss.xml'));
  assert.ok(html.includes('https://tasks.hagicode.com/rss.zh-CN.xml'));
  assert.match(robots, /User-agent: \*\nAllow: \//u);
  assert.match(robots, /Sitemap: https:\/\/tasks\.hagicode\.com\/sitemap-index\.xml/u);
  assert.match(sitemap, /https:\/\/tasks\.hagicode\.com\/sitemap-\d+\.xml/u);
  assert.ok(fs.existsSync(path.join(dist, 'rss.xml')));
  assert.ok(fs.existsSync(path.join(dist, 'rss.zh-CN.xml')));
});
