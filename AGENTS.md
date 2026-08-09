# hagitask-site

HagiTask 的站点前端仓库（Astro + Vite 静态站点）。

## Scope

- 本仓库负责 HagiTask 对外展示站点的前端实现。
- 后端业务逻辑与 API 在 `repos/hagitask`（参考 monorepo 根 `.hagicode/monospecs.yaml`）。
- 站点结构、导航与样式约定参考 `repos/site`。

## 技术约定

- 框架：Astro（基于 Vite 构建），路径别名 `@` 指向 `src`。
- 组件默认使用 `.astro`；需要交互时使用 Astro 内置 islands（如需要时引入 React）。
- 样式优先使用 Astro 组件作用域样式，`scopedStyleStrategy: 'where'`。

## 常用命令

```bash
npm install
npm run dev        # 本地开发，端口 43210
npm run build      # 构建到 dist/
npm run preview    # 预览
npm run typecheck  # astro check
```

## 注意事项

- 修改 `astro.config.mjs` 的 `site` 字段会改变 sitemap 与 canonical URL，部署前需确认。
- 不要将构建产物（`dist/`、`.astro/`）提交进仓库。
