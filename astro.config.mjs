import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { communityPackages } from './src/integrations/communityPackages.ts';
import { hagilight } from '@hagicode/hagilight/integration';

// https://astro.build/config
export default defineConfig({
  // 站点完整 URL，用于生成 sitemap 与 canonical 链接
  site: 'https://tasks.hagicode.com',
  // 站点部署在根路径
  base: '/',
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
    },
  },
  // Vite 配置（Astro 基于 Vite 构建）
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
  integrations: [
    mdx(),
    communityPackages(),
    hagilight(),
  ],
  scopedStyleStrategy: 'where',
});