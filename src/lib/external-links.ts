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
