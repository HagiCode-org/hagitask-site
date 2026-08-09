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
  components/   # 可复用 Astro 组件（如 Hero）
  layouts/      # 页面布局（BaseLayout）
  pages/        # 路由与页面（index.astro）
public/         # 静态资源（favicon.svg 等）
astro.config.mjs
tsconfig.json
```

## 关联仓库

- 后端服务：`repos/hagitask`（`https://github.com/HagiCode-org/hagitask`）
- 站点约定参考：`repos/site`
