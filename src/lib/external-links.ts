const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export interface ExternalLinkTarget {
  url: URL;
  isExternal: boolean;
}

export function resolveExternalLink(value: string | null | undefined, origin: string): ExternalLinkTarget | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value, origin);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    return { url, isExternal: url.origin !== new URL(origin).origin };
  } catch {
    return null;
  }
}

export function createWarningUrl(target: URL, origin: string, opensNewWindow = false): string {
  const warning = new URL('/external-link-warning/', origin);
  warning.searchParams.set('url', target.toString());
  if (opensNewWindow) warning.searchParams.set('window', 'new');
  return `${warning.pathname}${warning.search}`;
}

export function isExternalHttpUrl(value: string | null | undefined, origin: string): value is string {
  return resolveExternalLink(value, origin)?.isExternal === true;
}

// First-party destinations (shared link policy): the hagicode.com host, its subdomains,
// and github.com repositories in the HagiCode-org organization. Matched on the parsed host
// and path segment, never by substring, so look-alike hosts are third-party.
export function isFirstPartyUrl(url: URL): boolean {
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'hagicode.com' || host.endsWith('.hagicode.com')) return true;
  if (host !== 'github.com') return false;
  const [organization] = url.pathname.split('/').filter(Boolean);
  return organization?.toLowerCase() === 'hagicode-org';
}
