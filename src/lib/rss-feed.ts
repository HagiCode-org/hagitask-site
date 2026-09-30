import { getCatalog, type IndexEntry } from './community-index';

type TaskFeedLocale = 'en-US' | 'zh-CN';

function resolveLocale(route: string, lang: string): TaskFeedLocale {
  if (route === 'root' && lang === 'en-US') return 'en-US';
  if (route === 'zh-CN' && lang === 'zh-CN') return 'zh-CN';
  throw new Error(`Unsupported HagiTask RSS route "${route}" for language "${lang}".`);
}

export function createTaskFeed(
  tasks: readonly Pick<IndexEntry, 'taskId' | 'name' | 'summary'>[],
  locale: TaskFeedLocale,
) {
  const isChinese = locale === 'zh-CN';
  return {
    title: isChinese ? 'HagiTask 社区任务' : 'HagiTask Community Tasks',
    description: isChinese
      ? 'HagiCode 社区发布的可复用任务与工作流。'
      : 'New reusable tasks and workflows from the HagiCode community.',
    items: tasks.map((task) => ({
      title: task.name[locale] ?? task.name['en-US'] ?? task.taskId,
      description: task.summary[locale] ?? task.summary['en-US'] ?? '',
      link: `/tasks/${task.taskId}/`,
    })),
  };
}

export default function getFeed({ route, lang }: { route: string; lang: string }) {
  const locale = resolveLocale(route, lang);
  return createTaskFeed(getCatalog().index.tasks, locale);
}
