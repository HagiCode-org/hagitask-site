# hagitask-site

HagiTask 站点 —— HagiCode 生态下的任务与流程管理前端站点。

基于 [Astro](https://astro.build) 构建（Astro 底层使用 Vite），参考 `repos/site` 的约定进行初始化。

## 技术栈

- Astro `^6`
- Vite `^8`（通过 `package.json` 的 `overrides` 锁定）
- `@astrojs/sitemap`、`@astrojs/mdx`
- 路径别名：`@` -> `src`

## 开发

```bash
npm install
npm run dev        # 默认 http://localhost:43210
npm run build      # 产物输出到 dist/
npm run preview    # 预览构建产物
npm run typecheck  # astro check
```

## 目录结构

```
src/
  components/   # 可复用 Astro 组件（Hero、Footer、AnalyticsScripts 等）
  config/       # 站点配置（compliance.ts 备案信息）
  layouts/      # 页面布局（BaseLayout）
  pages/        # 路由与页面（index.astro）
public/         # 静态资源（favicon.svg 等）
astro.config.mjs
tsconfig.json
```

## 访问统计

51LA 与 Google Analytics 4 通过 `src/components/AnalyticsScripts.astro` 在 `BaseLayout.astro` 的 `<head>` 中挂载，两个 provider 相互独立。

- 脚本仅在生产构建（`import.meta.env.PROD`）输出，`npm run dev` 不加载任何统计脚本。
- 默认使用与官网一致的公开 ID，可用构建时环境变量覆盖：
  - `VITE_51LA_ID`：51LA 站点 ID
  - `VITE_GA_MEASUREMENT_ID`：GA4 Measurement ID

## 备案信息

页面底部 Footer 由 `src/components/Footer.astro` 通过 `BaseLayout.astro` 全站渲染，展示 ICP 与公安备案链接。备案文案与地址集中维护在 `src/config/compliance.ts`，更新备案信息只需修改该文件并重新构建。

## 关联仓库

- 后端服务：`repos/hagitask`（`https://github.com/HagiCode-org/hagitask`）
- 站点约定参考：`repos/site`