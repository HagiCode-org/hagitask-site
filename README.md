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
git submodule update --init --recursive   # 拉取 community-packages 及其内嵌的 hagitask
npm install
npm run dev            # 默认 http://localhost:43210
npm run build          # 产物输出到 dist/
npm run stage:schemas  # 将权威 Schema 复制到 dist/schemas/
npm run preview        # 预览构建产物
npm run typecheck      # astro check
npm run verify         # 校验发布产物（index/detail、ZIP 摘要、dist/schemas/）
npm test               # 发布产物脚本的单元测试
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

## 社区内容同步

站点内容来自 [`hagitask-community-packages`](https://github.com/HagiCode-org/hagitask-community-packages)，通过 `community-packages/` Git submodule 挂载（见 `.gitmodules`，`path = community-packages`，指向 Community 仓库）。任务包位于 `community-packages/data/<taskId>/`，其 Schema 权威来源是 Community 仓库内嵌的 `hagitask` nested submodule（`community-packages/hagitask/schemas`）。

- `community-packages` 子模块只记录一个 Community `main` 的提交指针，站点**不复制**社区内容。
- `Sync Community Content` 工作流（`.github/workflows/sync-community-content.yml`）按 `schedule`（每日）与 `workflow_dispatch` 运行：比较 Community `main` 最新提交与 `community-packages` 当前指针，若不同则只更新 `community-packages` 指针并推送到 Site `main`。
- 该推送触发既有的 `HagiTask Site Deploy gh-pages` 工作流，复用站点构建与发布链路；`Sync Community Content` 本身**不**以 `push` 触发，因此不会自递归。
- 工作流使用 `contents: write` 与 `concurrency` 串行锁；推送竞争失败时失败而非强制覆盖。`community-packages` 以外的任何工作树改动都会中止推送。

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

- 发布来源不是站点子模块：`HagiTask Site Deploy gh-pages` 工作流在构建后单独把 `HagiCode-org/hagitask` 下载到 runner 临时目录，ref 取自 `community-packages` 记录的 `hagitask` gitlink commit（取不到时回落到 `main`），并把实际 commit 写入 job summary，避免公开 Schema 与校验版本漂移。
- `npm run stage:schemas`（`scripts/schema-payload.mjs`）把该临时目录的 `schemas/` 原样复制到 `dist/schemas/`；本地不设 `HAGITASK_SCHEMA_SOURCE_DIR` 时默认使用 `community-packages/hagitask/schemas`。
- `npm run verify` 检查 9 个 Schema 均存在且可解析为 JSON，任一缺失或损坏都会在发布前失败。
- 站点自身不保存 Schema 副本，`dist/schemas/` 只在构建期生成。

## 包结构与规范

任务包目录名即 `taskId`（小写 kebab-case），必须与 `manifest.json` 的 `taskPresetId` 一致，且全局唯一。每个包位于 `community-packages/data/<taskId>/`，包含 `manifest.json`、`backend/`、`frontend/`、`locales/`、`store-page/`。完整布局与贡献步骤见社区仓库 `README.md`。

## 故障恢复

- 同步失败（如 Community 不可达或 `community-packages` 无法更新）：工作流以可操作错误失败，**不会**推送半成品状态；下一轮调度会重试。
- 发布期校验失败：构建步骤失败，不会发布错误产物；修复在 Community 仓库的源文件后重新同步。
- 需要回滚同步：停用 `Sync Community Content` 的 `schedule`（或删除该工作流），站点可继续使用最后一次已提交的 `community-packages` 指针。

## 关联仓库

- 社区包源：`repos/hagitask-community-packages`（`https://github.com/HagiCode-org/hagitask-community-packages`）
- 后端服务：`repos/hagitask`（`https://github.com/HagiCode-org/hagitask`）
- 站点约定参考：`repos/site`