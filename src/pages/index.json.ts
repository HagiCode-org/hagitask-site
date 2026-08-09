import type { APIRoute } from 'astro';
import { getCatalog, minify } from '@/lib/community-index';

export const GET: APIRoute = () => {
  const { index } = getCatalog();
  return new Response(minify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
