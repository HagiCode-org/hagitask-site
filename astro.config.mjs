import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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
    sitemap(),
    mdx(),
  ],
  scopedStyleStrategy: 'where',
});