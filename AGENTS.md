# hagitask-site

HagiTask 的站点前端仓库（Astro + Vite 静态站点）。

## Scope

- 本仓库负责 HagiTask 对外展示站点的前端实现。
- 本站点没有自有后端；预设任务 Schema 与校验 CLI 在 `repos/hagitask`，社区任务包内容在 `repos/hagitask-community-packages`（仓库清单见 monorepo 根 `.hagicode/monospecs.yaml`）。
- 站点结构、导航与样式约定参考 `repos/site`。

## 技术约定

- 框架：Astro（基于 Vite 构建），路径别名 `@` 指向 `src`。
- 组件默认使用 `.astro`；需要交互时使用 Astro 内置 islands（如需要时引入 React）。
- 样式优先使用 Astro 组件作用域样式，`scopedStyleStrategy: 'where'`。
- 目录：`src/pages/`（`index.astro`、`index.json.ts`、`tasks/`、`external-link-warning.astro`）、`src/layouts/BaseLayout.astro`、`src/components/`、`src/lib/`（`community-index.ts`、`external-links.ts` 等）、`src/integrations/communityPackages.ts`、`scripts/`（`schema-payload.mjs`、`verify-publication.mjs`、`community-commit.mjs`、`assert-sync-config.mjs`）、`test/*.test.mjs`、`docs/external-links.md`。

## 常用命令

```bash
npm install
npm run dev        # 本地开发，端口默认 43210（可用 PORT_WEBSITE 覆盖，preview 同）
npm run build      # 构建到 dist/（从 HAGITASK_COMMUNITY_SOURCE_DIR 或本地 community-packages/ 读取）
npm run preview    # 预览
npm run typecheck  # astro check
npm run verify     # 校验发布产物（index/detail Schema、ZIP 摘要、URL 稳定性）
npm run stage:schemas  # 把 @hagicode/hagitask 的 Schema 复制到 dist/schemas/
npm test           # node --test "test/**/*.test.mjs"
node scripts/assert-sync-config.mjs   # 校验同步工作流配置
```

- 运行环境：Node.js 24+（`engines`，deploy 工作流使用 Node 24）。
- 发布由 `.github/workflows/deploy-gh-pages.yml` 完成：build → `stage:schemas` → `verify` → 发布 gh-pages；本地改动应能通过同一序列。发布载荷由 `.github/gh-pages/`（`esa.jsonc`、`wrangler.jsonc`）加 `dist/` 组装为 artifact（含隐藏文件）后推送到 gh-pages 分支根目录。
- 设计与产品上下文见根目录 `PRODUCT.md` 与 `DESIGN.md`；首页主视觉为 `src/components/CatalogHero.astro`。

## 社区内容来源

- 站点内容来自 `hagitask-community-packages`，**不再**以 Git submodule 挂载。最近一次成功发布的 Community 提交记录在根目录 `community-packages.commit`（单行 40 位小写 hex SHA）。
- 构建优先从 `HAGITASK_COMMUNITY_SOURCE_DIR` 指向的 Community checkout 读取 `data/`；未设置时自动使用同级 `../hagitask-community-packages/`，再回退到本地 `community-packages/` checkout。`@hagicode/hagitask@0.1.2` 负责包源校验与发布 schema，`src/lib/community-index.ts` 继续对生成的 `/index.json` 与 `/tasks/<taskId>.json` 做 Schema 校验后发布。
- `Sync Community Content` 工作流（`.github/workflows/sync-community-content.yml`）定时/手动比较 Community `main` 与 `community-packages.commit`，仅在变化时触发 `HagiTask Site Deploy gh-pages`（传入精确 commit），并在其成功后回写状态文件。
- 包的提交前校验在 Community 仓库内完成（`npm run validate`），本站点是发布前第二道防线。

## Schema 发布

- 站点把 HagiTask 的 9 份权威 Schema 发布到 `/schemas/**`，公开根地址为 `https://tasks.hagicode.com/schemas/`，路径与源码目录一一对应。
- 发布来源由 deploy 工作流在构建阶段 `shallow clone` 精确 Community commit 到 runner 临时目录并暴露 `HAGITASK_COMMUNITY_SOURCE_DIR`；Schema 从已安装的 `@hagicode/hagitask@0.1.2` 经 `npm run stage:schemas` 复制到 `dist/schemas/`。
- 不要把 Schema 复制进站点源码；`scripts/schema-payload.mjs` 的 `EXPECTED_SCHEMA_PATHS` 是发布契约，新增或删除权威 Schema 时同步更新它和 `test/schema-payload.test.mjs`。

## 注意事项

- 修改 `astro.config.mjs` 的 `site` 字段会改变 sitemap 与 canonical URL，部署前需确认。
- 不要将构建产物（`dist/`、`.astro/`）提交进仓库。
- 不要手工修改 `community-packages.commit`，也不要把本地 `community-packages/` checkout 提交进仓库；同步状态由 `Sync Community Content` 工作流负责写入。

## 共享站点壳层

- `BaseLayout.astro` 统一挂载 `Header`、使用 `@hagicode/hagilight-core` 的 `Footer` 与 `PromotoBanner`，并集中管理 `hagitask-locale`、`hagitask-theme` 偏好。切换语言时保留同一个 Footer 节点。
- 页面内容使用 `--max-width`、`--content-gap`、`--color-surface` 和 `--color-border` 等共享 token；双语文案继续使用 `.locale-en` / `.locale-zh`。
- `astro.config.mjs` 注册 `mdx()`、本地 `communityPackages()`（`src/integrations/communityPackages.ts`）与 `hagilight()` 集成；`@hagicode/hagilight` / `hagilight-core` 以精确版本固定（当前 0.14.0），升级时两者同步。
- Astro uses Hagilight's default discovery integration; the site does not define custom RSS routes or crawler policies.
- `BaseLayout.astro` 使用 Hagilight SEO Head 生成页面级 canonical、description、Open Graph 与 Twitter 元数据；双语内容共用 URL，不要添加虚假的 locale alternates。外链警告页保留 noindex 元数据，但不配置站点级 sitemap 过滤。
- 新增外部链接必须使用 `target="_blank"` 时按目标分类设置 `rel`：同源或第一方（`hagicode.com`、`*.hagicode.com`、`github.com/HagiCode-org`）使用 `rel="noopener"`，**不得**使用 `noreferrer`；第三方使用 `rel="noopener noreferrer"`；同标签页链接不设置策略 `rel`。分类实现见 `src/lib/external-links.ts` 的 `isFirstPartyUrl()`，必须按解析后的 host 匹配，不要用子串匹配。详见 `docs/external-links.md`。不要修改 Referrer-Policy，也不要引入 `unsafe-url`。推广由 Hagilight banner 管理，不要添加独立的本地 promotion mount 或 loader。