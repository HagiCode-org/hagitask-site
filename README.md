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

## 社区内容同步

站点内容来自 [`hagitask-community-packages`](https://github.com/HagiCode-org/hagitask-community-packages)，通过 `data/` Git submodule 挂载（见 `.gitmodules`，`path = data`，指向 Community 仓库）。

- `data` 子模块只记录一个 Community `main` 的提交指针，站点**不复制**社区内容。
- `Sync Community Content` 工作流（` .github/workflows/sync-community-content.yml`）按 `schedule`（每日）与 `workflow_dispatch` 运行：比较 Community `main` 最新提交与 `data` 当前指针，若不同则只更新 `data` 指针并推送到 Site `main`。
- 该推送触发既有的 `HagiTask Site Deploy gh-pages` 工作流，复用站点构建与发布链路；`Sync Community Content` 本身**不**以 `push` 触发，因此不会自递归。
- 工作流使用 `contents: write` 与 `concurrency` 串行锁；推送竞争失败时失败而非强制覆盖。`data` 以外的任何工作树改动都会中止推送。

## 包校验（提交前防线）

社区包在 [`hagitask-community-packages`](https://github.com/HagiCode-org/hagitask-community-packages) 仓库本地校验，再进入本站点构建：

```bash
cd ../hagitask-community-packages
npm install
npm run validate      # 退出码非零即阻断合并
```

`validate-packages` 是该仓库对 `main` 的 **required status check**。站点构建期（`src/lib/community-index.ts` 的 `assertValid`）继续对生成的 `/index.json`、`/tasks/<taskId>.json` 做最终 Schema 校验，形成提交前与发布前两级防线。

## 包结构与规范

任务包目录名即 `taskId`（小写 kebab-case），必须与 `manifest.json` 的 `taskPresetId` 一致，且全局唯一。每个包包含 `manifest.json`、`backend/`、`frontend/`、`locales/`、`store-page/`。完整布局与贡献步骤见社区仓库 `README.md`。

## 故障恢复

- 同步失败（如 Community 不可达或 `data` 无法更新）：工作流以可操作错误失败，**不会**推送半成品状态；下一轮调度会重试。
- 发布期校验失败：构建步骤失败，不会发布错误产物；修复在 Community 仓库的源文件后重新同步。
- 需要回滚同步：停用 `Sync Community Content` 的 `schedule`（或删除该工作流），站点可继续使用最后一次已提交的 `data` 指针。

## 关联仓库

- 社区包源：`repos/hagitask-community-packages`（`https://github.com/HagiCode-org/hagitask-community-packages`）
- 后端服务：`repos/hagitask`（`https://github.com/HagiCode-org/hagitask`）
- 站点约定参考：`repos/site`