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
npm run build      # 构建到 dist/（从 HAGITASK_COMMUNITY_SOURCE_DIR 或本地 community-packages/ 读取）
npm run preview    # 预览
npm run typecheck  # astro check
npm run verify     # 校验发布产物（index/detail Schema、ZIP 摘要、URL 稳定性）
node scripts/assert-sync-config.mjs   # 校验同步工作流配置
```

## 社区内容来源

- 站点内容来自 `hagitask-community-packages`，**不再**以 Git submodule 挂载。最近一次成功发布的 Community 提交记录在根目录 `community-packages.commit`（单行 40 位小写 hex SHA）。
- 构建从 `HAGITASK_COMMUNITY_SOURCE_DIR` 指向的 Community checkout 根目录读取 `data/` 与 `hagitask/schemas/`；未设置时回退到本地 `community-packages/` checkout。`src/lib/community-index.ts` 读取该来源，对生成的 `/index.json` 与 `/tasks/<taskId>.json` 做 Schema 校验后发布。
- `Sync Community Content` 工作流（`.github/workflows/sync-community-content.yml`）定时/手动比较 Community `main` 与 `community-packages.commit`，仅在变化时触发 `HagiTask Site Deploy gh-pages`（传入精确 commit），并在其成功后回写状态文件。
- 包的提交前校验在 Community 仓库内完成（`npm run validate`），本站点是发布前第二道防线。

## Schema 发布

- 站点把 HagiTask 的 9 份权威 Schema 发布到 `/schemas/**`，公开根地址为 `https://tasks.hagicode.com/schemas/`，路径与源码目录一一对应。
- 发布来源由 deploy 工作流在构建阶段 `shallow clone` 精确 Community commit 到 runner 临时目录并暴露 `HAGITASK_COMMUNITY_SOURCE_DIR`；Schema 从该 checkout 的 `hagitask/schemas/` 经 `npm run stage:schemas` 复制到 `dist/schemas/`。HagiTask/Community 不是本仓库的子模块。
- 不要把 Schema 复制进站点源码；`scripts/schema-payload.mjs` 的 `EXPECTED_SCHEMA_PATHS` 是发布契约，新增或删除权威 Schema 时同步更新它和 `test/schema-payload.test.mjs`。

## 注意事项

- 修改 `astro.config.mjs` 的 `site` 字段会改变 sitemap 与 canonical URL，部署前需确认。
- 不要将构建产物（`dist/`、`.astro/`）提交进仓库。
- 不要手工修改 `community-packages.commit`，也不要把本地 `community-packages/` checkout 提交进仓库；同步状态由 `Sync Community Content` 工作流负责写入。