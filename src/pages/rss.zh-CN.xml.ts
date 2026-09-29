import type { APIRoute } from 'astro';
import { generateRssFeed } from '@hagicode/hagilight/rss';
import { getCatalog } from '@/lib/community-index';

export const GET: APIRoute = ({ site }) => {
  const { index } = getCatalog();
  return generateRssFeed({
    site,
    language: 'zh-CN',
    title: 'HagiTask 社区任务',
    description: 'HagiCode 社区发布的可复用任务与工作流。',
    items: index.tasks.map((task) => ({
      title: task.name['zh-CN'] ?? task.name['en-US'] ?? task.taskId,
      description: task.summary['zh-CN'] ?? task.summary['en-US'] ?? '',
      link: `/tasks/${task.taskId}/`,
    })),
  });
};
