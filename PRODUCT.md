# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

HagiCode 生态内的开发者与 AI 代理使用者（主要用户）：希望发现并复用现成的"任务包 / 工作流预设"。他们在目录中浏览、按分类搜索与筛选，下载包含后端 prompts、前端面板/命令、本地化与商店页的 `.zip` 任务包。

任务包发布者 / 贡献者（次要用户）：HagiCode 组织及社区成员，通过 `hagitask-community-packages` Git 子模块提交任务定义。

<!-- inferred: 主要用户画像基于产品形态与 data 子模块内容推断；本次无交互式用户访谈。 -->

## Product Purpose

HagiTask 是 HagiCode 生态下、面向"可复用任务包"的公开双语（en-US / zh-CN）目录与分发站点。站点以 Git 子模块为唯一数据源，按 v1 schema 校验，生成 `/index.json`、按任务的详情 JSON 与可下载 `.zip` 包（附带 SHA-256 完整性摘要），并以静态资源发布。

存在的意义：让开发者快速找到契合的工作流，读懂其兼容性（agent / skills / cli），并有信心地安装复用。成功标准 = 一个开发者能找到合适的任务包、理解其兼容要求、并可靠地下载安装。

## Positioning

每一个任务包都经过 schema 校验，并以可验证的 SHA-256 摘要 + 确定性归档发布，因此安装可复现、可防篡改；目录是完全静态的、且从单一本地化源头实现双语。普通"链接集合"站点无法真实宣称具备"可验证、schema 一致的分发"。

关键的关注点分离：内容真相只存在于 `data/` 子模块，站点是纯展示层。

## Operating Context

- 站点是静态前端；后端业务逻辑与 API 在独立仓库 `repos/hagitask`。
- 构建读取 `community-packages/` Git 子模块（`hagitask-community-packages`），任务包位于 `community-packages/data/<taskId>/`；构建前需 `git submodule update --init --recursive`（同时拉取内嵌的 `hagitask` 子模块以取得权威 Schema）。
- 站点通过 `Sync Community Content` 工作流（定时 + 手动）将 `community-packages` 子模块指针更新到 Community `main`，随后触发既有 `HagiTask Site Deploy gh-pages` 重建发布；同步只移动子模块指针，不复制或改写社区内容。
- 社区包的提交前校验在 Community 仓库内完成（`validate-packages` required check，`npm run validate`）；站点构建期（`src/lib/community-index.ts` 的 `assertValid`）是发布前第二道防线。
- 产物：`/index.json`、`/tasks/<taskId>.json`、`/packages/<taskId>.zip`。
- 规范任务 ID（canonical）：`ui-master`、`claude-md-update`、`last30days`、`ponytail`、`goal`、`openspec-spec-compress`。`agentsmd` / `portytail` 仅为面向用户的别名，非规范 ID。
- 本地化：默认 `en-US`，支持 `en-US` + `zh-CN`；要求双语结构对齐（locale parity）。

## Capabilities and Constraints

能力：
- 浏览 / 客户端搜索 / 按分类筛选目录；明确的空状态。
- 每个任务的详情页与可下载 zip 包（含 SHA-256 完整性）。
- Sitemap 与 MDX 支持。

约束：
- `data/` 子模块是唯一真相源；禁止在站点内重复定义任务。
- `manifest.json` 的 `version` 使用语义化版本；发布变更时递增。
- Schema 校验失败则构建失败（无效源数据不可发布）。
- Astro 组件作用域样式（`scopedStyleStrategy: 'where'`）；路径别名 `@` → `src`。
- 双语内容对齐是硬性要求（EN / ZH 共享结构）。
- 不提交构建产物（`dist/`、`.astro/`）。

术语：task package（任务包）、taskId（规范 ID）、manifest.json、task-preset.json、compatibility（agent/skills/cli）、store page、integrity / SHA-256。

## Brand Commitments

- 名称：HagiTask，隶属 HagiCode 生态。
- 标语（来自现有 Hero，双语）：中文"HagiCode 生态下的任务与流程管理站点"；英文"Discover reusable workflows for HagiCode."
- 用户明确要求"按照产品调性"初始化：声音保持技术化、可靠、克制（非霓虹 AI 落地页风格），且天然双语。这是一条约束展示与文案的绑定承诺，但不规定具体视觉世界（视觉由 DESIGN.md / new-work 负责）。

<!-- inferred: "技术、可靠、克制"的语气取自既有 DESIGN.md 的 Overview 与现有 Hero 文案，作为用户确认的绑定声音承诺记录。 -->

## Evidence on Hand

- 真实内容：6 个已上线的社区任务包（ui-master、claude-md-update、last30days、ponytail、goal、openspec-spec-compress）。
- 真相源仓库：`hagitask-community-packages`；后端仓库：`hagitask`。
- 既有 `DESIGN.md`（现行深色设计系统）与 `.impeccable/design.json` 侧车。
- 缺失（后续工作不得编造）：无用户证言、无定价、无基准测试、无许可/部署声明。

## Product Principles

1. 真相源分离：内容只存在于子模块，站点仅做展示，绝不重复定义。
2. 默认可验证：社区仓库提交前校验（`validate-packages` required check）+ 站点构建期 Schema 校验 + SHA-256 完整性 + 确定性归档——以证据建立信任，而非宣称。两层防线分别阻断不合格提交与不合格发布。
3. 双语对齐：en-US 与 zh-CN 为第一等公民，结构共享，绝不偏废。
4. 静态且克制：静态生成、无多余的运行时；呈现技术、冷静。
5. 开放贡献：社区任务包经子模块以 semver 接受。

## Accessibility & Inclusion

- 双语（en-US / zh-CN）对齐是核心包容要求；切换语言不得改变布局层级。
- 既有代码中已确认的可用性原则（需在新工作中延续）：可见的键盘焦点样式（清晰、足够对比的描边 + offset）；明确的空状态；不单独依赖颜色传达选中 / 焦点 / 语言状态。