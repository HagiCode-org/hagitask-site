import type { APIRoute } from 'astro';
import { generateRssFeed } from '@hagicode/hagilight/rss';
import { getCatalog } from '@/lib/community-index';

export const GET: APIRoute = ({ site }) => {
  const { index } = getCatalog();
  return generateRssFeed({
    site,
    language: 'en-US',
    title: 'HagiTask Community Tasks',
    description: 'New reusable tasks and workflows from the HagiCode community.',
    items: index.tasks.map((task) => ({
      title: task.name['en-US'] ?? task.taskId,
      description: task.summary['en-US'] ?? '',
      link: `/tasks/${task.taskId}/`,
    })),
  });
};
