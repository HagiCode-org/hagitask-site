# hagitask-site

HagiTask Site is the frontend site for task and workflow management within the HagiCode ecosystem.

Visit the site: https://tasks.hagicode.com/

## HagiTask guides

- [HagiTask introduction](https://docs.hagicode.com/guides/hagitask/introduction/)
- [Installation guide](https://docs.hagicode.com/guides/hagitask/installation/)
- [Usage guide](https://docs.hagicode.com/guides/hagitask/usage/)
- [Community contribution guide](https://docs.hagicode.com/guides/hagitask/community/)

## Related repositories

- Community packages source: `hagitask-community-packages` (`https://github.com/HagiCode-org/hagitask-community-packages`)
- Backend service: `hagitask` (`https://github.com/HagiCode-org/hagitask`)
- Site conventions reference: `repos/site`

## Shared shell, feed, and SEO

- `@hagicode/hagilight` provides the shared footer with its default links, promotion banner, RSS renderer, and SEO head. The footer's built-in RSS links target `/rss.xml` and the Simplified Chinese `/rss.zh-CN.xml` feed.
- Hagilight 0.5.0 generates valid empty default, English-alias, and Simplified Chinese feeds. The RSS integration does not extract content from the community catalog.
- `BaseLayout.astro` owns canonical URLs, descriptions, Open Graph, Twitter, and RSS discovery. English and Simplified Chinese share URLs, so the site does not emit locale alternates. The external-link warning page is `noindex` and excluded from the sitemap.

## Detail page presentation

The command catalog, prompt context, and localized `store-page` Markdown used by task
detail pages are build-time presentation data. They are read from each community
package but are intentionally kept outside the published `DetailDoc`; the existing
JSON schema, package URLs, and integrity fields remain unchanged.
