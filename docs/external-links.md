# External links

All user-facing external links in the site are intercepted by the shared event
handler in `BaseLayout.astro` and routed through `/external-link-warning/`.
Relative URLs and URLs on the current origin remain direct navigations.

Only absolute `http:` and `https:` destinations may be continued. New-tab
links must retain `target="_blank"` and `rel="noopener noreferrer"`; the
warning route carries the new-tab intent and opens the validated destination
with opener isolation.
