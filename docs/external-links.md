# External links

All user-facing external links in the site are intercepted by the shared event
handler in `BaseLayout.astro` and routed through `/external-link-warning/`.
Relative URLs and URLs on the current origin remain direct navigations.

Only absolute `http:` and `https:` destinations may be continued. New-tab
links must retain `target="_blank"`; the warning route carries the new-tab
intent and opens the validated destination with opener isolation.

## First-party link policy

Every destination is classified from its parsed URL (never by substring):

- **First-party**: host `hagicode.com` or any `*.hagicode.com` subdomain, or
  `github.com` whose first path segment is `HagiCode-org` (case-insensitive).
  `isFirstPartyUrl()` in `src/lib/external-links.ts` implements this rule.
- **Same-origin**: relative URLs and absolute URLs on the current origin.
- **Third-party**: every other `http:` or `https:` destination. Look-alikes such
  as `hagicode.com.evil.example`, `nothagicode.com`,
  `github.com/HagiCode-org-fake/site` and `example.com/hagicode.com` are
  third-party.

`rel` for new-tab links follows the class:

| Class | `rel` |
| --- | --- |
| Same-origin or first-party | `noopener` (never `noreferrer`) |
| Third-party | `noopener noreferrer` |
| Same-tab link | no policy `rel` |

The external-link warning page opens confirmed destinations with `'noopener'`
for first-party targets (the referring origin is kept) and with
`'noopener,noreferrer'` for third-party targets. The site keeps the default
origin-only referrer policy and never sets `unsafe-url`.
