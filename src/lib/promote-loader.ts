const INDEX_ORIGIN = 'https://index.hagicode.com';

type RecordValue = Record<string, unknown>;

export interface ActivePromotion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  link: string;
  image?: { src: string; alt?: string };
}

const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null;
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;

function localized(value: unknown, locale: string) {
  if (!isRecord(value)) return null;
  return text(value[locale]) ?? text(value[locale.split('-')[0]]) ?? text(value['en-US']) ?? text(value.en) ?? Object.values(value).map(text).find(Boolean) ?? null;
}

async function json(fetchImpl: typeof fetch, url: string) {
  const response = await fetchImpl(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Promotion request failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function loadFirstActivePromotion(locale = 'en-US', fetchImpl: typeof fetch = fetch): Promise<ActivePromotion | null> {
  try {
    const catalog = await json(fetchImpl, `${INDEX_ORIGIN}/index-catalog.json`);
    const entries = isRecord(catalog) && Array.isArray(catalog.entries) ? catalog.entries : [];
    const pathFor = (id: string) => {
      const entry = entries.find((item) => isRecord(item) && item.id === id);
      const path = isRecord(entry) ? text(entry.path) : null;
      return path ? new URL(path, INDEX_ORIGIN).toString() : null;
    };
    const flagsUrl = pathFor('promotion-flags');
    const contentUrl = pathFor('promotion-content');
    if (!flagsUrl || !contentUrl) return null;
    const [flagsPayload, contentPayload] = await Promise.all([json(fetchImpl, flagsUrl), json(fetchImpl, contentUrl)]);
    const flags = isRecord(flagsPayload) && Array.isArray(flagsPayload.promotes) ? flagsPayload.promotes : [];
    const contents = isRecord(contentPayload) && Array.isArray(contentPayload.contents) ? contentPayload.contents : [];
    const now = Date.now();
    for (const flag of flags) {
      const id = isRecord(flag) ? text(flag.id) : null;
      if (!isRecord(flag) || flag.on !== true || !id) continue;
      const start = text(flag.startTime) ? Date.parse(flag.startTime as string) : null;
      const end = text(flag.endTime) ? Date.parse(flag.endTime as string) : null;
      if ((start !== null && !Number.isFinite(start)) || (end !== null && !Number.isFinite(end)) || (start !== null && now < start) || (end !== null && now >= end)) continue;
      const content = contents.find((item) => isRecord(item) && item.id === id);
      const link = isRecord(content) ? text(content.link) : null;
      if (!isRecord(content) || !link) continue;
      const title = localized(content.title, locale);
      const description = localized(content.description, locale);
      if (!title || !description || !/^https?:\/\//.test(link)) continue;
      const imageSrc = isRecord(content.image) ? text(content.image.src) : null;
      const image = imageSrc ? { src: new URL(imageSrc, INDEX_ORIGIN).toString(), alt: isRecord(content.image) ? text(content.image.alt) ?? title : title } : undefined;
      return { id, title, description, ctaLabel: localized(content.cta, locale) ?? (locale === 'zh-CN' ? '立即前往' : 'Open'), link, image };
    }
  } catch {
    return null;
  }
  return null;
}
