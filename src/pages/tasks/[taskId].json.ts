import type { APIRoute, GetStaticPaths } from 'astro';
import { getCatalog, minify } from '@/lib/community-index';

export const getStaticPaths: GetStaticPaths = () => {
  const { details } = getCatalog();
  return details.map((detail) => ({ params: { taskId: detail.taskId } }));
};

export const GET: APIRoute = ({ params }) => {
  const { details } = getCatalog();
  const detail = details.find((d) => d.taskId === params.taskId);
  if (!detail) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(minify(detail), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
