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

## Detail page presentation

The command catalog, prompt context, and localized `store-page` Markdown used by task
detail pages are build-time presentation data. They are read from each community
package but are intentionally kept outside the published `DetailDoc`; the existing
JSON schema, package URLs, and integrity fields remain unchanged.
