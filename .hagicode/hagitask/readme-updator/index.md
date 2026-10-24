---
public: true
multilingual: false
style: product
---

# README requirements

## Product focus

- Introduce HagiTask Site as the public, bilingual (en-US and zh-CN) catalog at https://tasks.hagicode.com where people discover reusable HagiCode task packages and workflow presets, open a detail page for each task and download its package.
- Address people who want to find and use HagiTask presets first, and contributors who want to publish one second. Send both to the HagiTask guides for depth.
- Lead with the positioning statement and the site link; describe what visitors can do on the site rather than how it is built.

## Required content

- Open with the positioning statement and the site link, keeping the website badge the README carries.
- Keep the HagiTask guide links at https://docs.hagicode.com (introduction, installation, usage, community contribution) and the related repositories (`hagitask-community-packages`, `hagitask`), linking to documentation instead of copying it.
- Describe the visitor-facing capabilities the site actually provides, as the repository shows: browsing the task catalog, a detail page per task with its commands and store page, and downloadable task packages. Do not promise capabilities beyond what the site shows.

## Exclusions

- Exclude tokens, secret values, internal hosts, machine-specific paths and private links.
- Keep repository maintenance instructions out of the README: repository layout, internal architecture, shared shell, feed and SEO wiring, CI, build internals and contribution workflow. Do not list features the repository does not show.
