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
npm run build      # 构建到 dist/（需先初始化 community-packages 及嵌套子模块）
npm run preview    # 预览
npm run typecheck  # astro check
npm run verify     # 校验发布产物（index/detail Schema、ZIP 摘要、URL 稳定性）
node scripts/assert-sync-config.mjs   # 校验同步工作流配置
```

## 社区内容来源

- 站点内容来自 `hagitask-community-packages`，通过 `community-packages/` Git submodule 挂载（`.gitmodules` 中 `path = community-packages`）。任务包位于 `community-packages/data/<taskId>/`，其 Schema 权威来源是 Community 仓库内嵌的 `hagitask` nested submodule。
- 构建前需 `git submodule update --init --recursive` 初始化 `community-packages` 及其内嵌的 `hagitask`；`src/lib/community-index.ts` 读取 `community-packages/data/`，对生成的 `/index.json` 与 `/tasks/<taskId>.json` 做 Schema 校验后发布。
- `Sync Community Content` 工作流（`.github/workflows/sync-community-content.yml`）定时/手动把 `community-packages` 指针更新到 Community `main`，并触发 `HagiTask Site Deploy gh-pages` 重建发布。
- 包的提交前校验在 Community 仓库内完成（`npm run validate`），本站点是发布前第二道防线。

## 注意事项

- 修改 `astro.config.mjs` 的 `site` 字段会改变 sitemap 与 canonical URL，部署前需确认。
- 不要将构建产物（`dist/`、`.astro/`）提交进仓库。
- 不要修改 `community-packages/` 子模块内容或手工提交子模块指针；同步由 `Sync Community Content` 工作流负责。