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
git clone https://github.com/HagiCode-org/hagitask-community-packages.git community-packages   # 本地开发回退源（可选）
npm install
npm run dev            # 默认 http://localhost:43210
npm run build          # 产物输出到 dist/（从 HAGITASK_COMMUNITY_SOURCE_DIR 或本地 community-packages/ 读取）
npm run stage:schemas  # 将权威 Schema 复制到 dist/schemas/
npm run preview        # 预览构建产物
npm run typecheck      # astro check
npm run verify         # 校验发布产物（index/detail、ZIP 摘要、dist/schemas/）
npm test               # 发布产物脚本与同步状态的单元测试
```

本地构建不再依赖 Git submodule。构建从 `HAGITASK_COMMUNITY_SOURCE_DIR` 指向的 Community checkout 根目录读取
`data/` 与 `hagitask/schemas/`；未设置该变量时回退到仓库内已存在的 `community-packages/` 本地 checkout。

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

## 社区内容同步

站点内容来自 [`hagitask-community-packages`](https://github.com/HagiCode-org/hagitask-community-packages)。站点**不再**以 Git submodule 挂载 Community 仓库；改为在 `community-packages.commit` 状态文件（根目录，严格为一行 40 位小写十六进制 SHA）中持久化“最近一次成功发布的 Community 提交”。任务包位于 Community 仓库的 `data/<taskId>/`，其 Schema 权威来源是 Community 仓库内的 `hagitask/schemas/`。

- 站点**不复制**社区内容；发布只读取指定 Community commit 的动态 checkout。
- `Sync Community Content` 工作流（`.github/workflows/sync-community-content.yml`）按 `schedule`（每小时）与 `workflow_dispatch` 运行：用 `git ls-remote` 读取 Community `main` 最新提交，与 `community-packages.commit` 比较。
  - 两者相同：记录 no-op 并结束，不改动工作树。
  - 两者不同：以 `gh workflow run` 触发 `HagiTask Site Deploy gh-pages` 并传入精确 commit，等待其结论。
- `HagiTask Site Deploy gh-pages` 工作流在构建阶段 `shallow clone` 精确 Community commit 到 runner 临时目录，通过 `HAGITASK_COMMUNITY_SOURCE_DIR` 暴露其根目录供内容索引与 Schema staging 读取；并在 Job Summary 记录 requested/resolved commit。未收到 `community_commit` 输入时，Deploy 回退读取 `community-packages.commit`。
- 仅当 Deploy **成功**时，同步工作流才把已发布 commit 写回 `community-packages.commit` 并推送到 Site `main`；失败、取消或超时均不更新状态，旧 SHA 保留以便重试。
- 同步工作流**不**以 `push` 触发，且 Deploy 工作流对 `community-packages.commit` 使用 `paths-ignore`，因此状态文件提交不会递归触发发布。
- 同步工作流使用 `contents: write` 与 `actions: write` 权限、`concurrency` 串行锁；状态提交使用非强制 push，并发 Site 改动导致推送竞争失败时失败而非覆盖。

## 包校验（提交前防线）

社区包在 [`hagitask-community-packages`](https://github.com/HagiCode-org/hagitask-community-packages) 仓库本地校验，再进入本站点构建：

```bash
cd ../hagitask-community-packages
npm install
npm run validate      # 退出码非零即阻断合并
```

`validate-packages` 是该仓库对 `main` 的 **required status check**。站点构建期（`src/lib/community-index.ts` 的 `assertValid`）继续对生成的 `/index.json`、`/tasks/<taskId>.json` 做最终 Schema 校验，形成提交前与发布前两级防线。

## Schema 发布

站点在 `https://tasks.hagicode.com/schemas/` 下发布 HagiTask 的 9 份权威 Schema（2 份 community 目录/详情 Schema 加 7 份 `task-preset-plugin/` 包 Schema），公开路径与源码目录一一对应，例如 `schemas/task-preset-plugin/manifest.schema.json` 对应 `https://tasks.hagicode.com/schemas/task-preset-plugin/manifest.schema.json`。

- 发布来源不是站点子模块：`HagiTask Site Deploy gh-pages` 工作流在构建阶段 `shallow clone` 精确 Community commit 到 runner 临时目录，并暴露 `HAGITASK_COMMUNITY_SOURCE_DIR` 指向其根目录；Schema 从该 checkout 的 `hagitask/schemas/` 读取，实际 commit 写入 Job Summary，避免公开 Schema 与校验版本漂移。
- `npm run stage:schemas`（`scripts/schema-payload.mjs`）把 `<HAGITASK_COMMUNITY_SOURCE_DIR>/hagitask/schemas/` 原样复制到 `dist/schemas/`；设置了 `HAGITASK_SCHEMA_SOURCE_DIR` 时优先使用该目录；本地两者均未设置时默认使用 `community-packages/hagitask/schemas`。
- `npm run verify` 检查 9 个 Schema 均存在且可解析为 JSON，任一缺失或损坏都会在发布前失败。
- 站点自身不保存 Schema 副本，`dist/schemas/` 只在构建期生成。

## 包结构与规范

任务包目录名即 `taskId`（小写 kebab-case），必须与 `manifest.json` 的 `taskPresetId` 一致，且全局唯一。每个包位于 Community 仓库的 `data/<taskId>/`，包含 `manifest.json`、`backend/`、`frontend/`、`locales/`、`store-page/`。完整布局与贡献步骤见社区仓库 `README.md`。

## 故障恢复

- 同步失败（如 Community 不可达、状态文件缺失/格式错误或 Deploy 未成功）：工作流以可操作错误失败，**不会**写入半成品状态；下一轮调度会重试。`community-packages.commit` 始终代表最近一次成功公开发布的 Community 版本。
- 发布期校验失败：构建步骤失败，不会发布错误产物；修复在 Community 仓库的源文件后重新触发同步。
- 需要回滚同步：将 `community-packages.commit` 改回已知成功的 SHA 并提交（或手动 `workflow_dispatch` 触发同步以重新发布该版本）。也可停用 `Sync Community Content` 的 `schedule`，站点继续服务最后一次已发布版本。

## 关联仓库

- 社区包源：`repos/hagitask-community-packages`（`https://github.com/HagiCode-org/hagitask-community-packages`）
- 后端服务：`repos/hagitask`（`https://github.com/HagiCode-org/hagitask`）
- 站点约定参考：`repos/site`