/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@hagicode/hagilight/rss' {
  interface RssFeedItem {
    title: string;
    description?: string;
    link: string;
    pubDate?: Date | string;
  }

  export function generateRssFeed(options: {
    site?: string | URL | null;
    baseUrl?: string;
    language?: string;
    title: string;
    description: string;
    items: RssFeedItem[];
  }): Response;
}
