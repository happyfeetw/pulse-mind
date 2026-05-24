# Codex 新闻自动化配置

这个方案不使用 OpenAI API 额度。流程是：

1. GitHub Actions 每天北京时间 `00:00`、`08:00`、`16:00` 抓取过去 8 小时内的 RSS 候选源，并创建一个包含 `@codex` 的 issue。
2. Codex Cloud 根据 issue 创建文章 PR，只提交 `content/articles/*.md`。
3. PR workflow 校验 Markdown、运行 lint/build，并可选自动合并。
4. PR 合并到 `main` 后，发布 workflow 校验 Markdown，并通过线上站点的内部 HTTPS webhook 导入生产数据库。

## 你需要配置的内容

### 1. Codex Cloud

1. 打开 `https://chatgpt.com/codex`。
2. 连接拥有本仓库权限的 GitHub 账号。
3. 在 Codex 中启用这个仓库。
4. 在 GitHub issue 里手动评论一次 `@codex hello`，确认 Codex 能响应。
5. Codex 环境不要配置 `DATABASE_URL`、部署 token 或生产密钥。Codex 只需要改 Markdown。
6. 如果希望 Codex 打开新闻原文链接，在 Codex environment 里开启 agent internet access，并只允许必要域名和 `GET/HEAD/OPTIONS` 方法。

参考：

- Codex Cloud: `https://platform.openai.com/docs/codex`
- Codex agent internet access: `https://platform.openai.com/docs/codex/agent-network`

### 2. GitHub Actions 权限

进入仓库 `Settings -> Actions -> General`：

1. 确认 Actions 已启用。
2. 在 `Workflow permissions` 中选择允许 workflow 创建 issue / PR 的权限。如果仓库策略较严格，选择 `Read and write permissions`。
3. 勾选允许 GitHub Actions 创建和批准 pull request 的选项，如果界面中有该选项。

### 3. GitHub Secrets

当前 Codex Cloud 路线不需要 `OPENAI_API_KEY`。生产 PostgreSQL 不对公网开放，因此 GitHub Actions 不需要 `DATABASE_URL` 或 SSH 私钥。

需要添加：

- `ARTICLE_IMPORT_SECRET`：和生产服务器 `.env` 中一致的内部导入密钥。

### 4. GitHub Variables

进入 `Settings -> Secrets and variables -> Actions -> Variables`，可选添加：

- `NEWS_MAX_ITEMS`：每次运行的候选新闻数量，默认 `12`。
- `NEWS_MAX_ITEMS_PER_SOURCE`：每个来源最多进入候选池的数量，默认 `3`，用于避免单个高频来源刷屏。
- `NEWS_LOOKBACK_HOURS`：每次运行向前回看的小时数，默认 `8`。
- `NEWS_RSS_TIMEOUT_MS`：RSS 请求超时，默认 `10000`。
- `CODEX_NEWS_ARTICLE_LENGTH`：文章长度要求，默认 `1200-1800 Chinese characters`。
- `CODEX_NEWS_TARGET_DIR`：文章目录，默认 `content/articles`。
- `CODEX_NEWS_PROMPT_PATH`：Codex 任务提示词模板路径，默认 `docs/prompts/codex-ai-briefing.md`。
- `AUTO_MERGE_CODEX_NEWS`：设为 `true` 后，纯文章 PR 在校验通过后会自动 squash merge。
- `ARTICLE_IMPORT_URL`：可选，默认可使用 `https://blog.badger-tech.fun/api/internal/articles/import`。

建议先不启用 `AUTO_MERGE_CODEX_NEWS`。手动观察 2-3 天后，如果内容质量稳定，再设为 `true`。

## Codex 任务提示词

每次定时任务的 issue 正文由 `scripts/prepare-codex-news-issue.ts` 生成，提示词模板保存在：

```text
docs/prompts/codex-ai-briefing.md
```

模板使用以下占位符，由脚本在运行时替换：

- `{{TODAY}}`：上海时区日期。
- `{{TARGET_DIR}}`：文章目录。
- `{{ARTICLE_LENGTH}}`：文章长度要求。
- `{{SOURCE_GUIDE}}`：信息源说明。
- `{{CANDIDATES}}`：定时任务窗口内的 RSS 候选源列表。

修改提示词后，先用下面命令预览最终 issue 正文：

```bash
npm run --silent news:codex-issue
```

## 当前信息源

候选源会优先按“软件工程师相关度”排序，再按发布时间排序。文章生成时不追求覆盖所有 AI 热点，也不强行写成单一主题分析，而是优先选 4-7 条值得软件工程师阅读、尝试或跟进的内容，重点服务 AI 应用开发、大模型、coding-agent、前端、后端、开发者工具和工程实践。

- Hacker News：优先选全球工程师、创业者讨论的 AI 应用、大模型、coding-agent、开源项目、前后端开发工具和技术争议。
- Hacker News LLM Search：补充 HN 最新提交中的 LLM、AI 应用、coding-agent、开发者工具和工程实践讨论，优先选指向 GitHub、技术博客、论文或可试用工具的条目。
- The Verge AI：只在产品、安全、平台政策或行业争议对 AI 应用开发、模型集成、数据使用、权限边界、用户体验设计有工程启发时采用。
- TechCrunch AI：只在创业产品、平台、API、SDK、基础设施、定价、部署方式或商业化路径对开发者有参考价值时采用，跳过纯融资新闻和硬件体验文。
- 量子位：优先跟进模型、Agent、框架、论文、工程实践、开发者工具、前后端 AI 应用案例的技术细节。
- arXiv cs.AI / cs.CL：重点抓会影响 AI 应用、coding-agent、RAG、推理、模型部署或开发工具的方法、评测、限制和工程影响。
- BestBlogs.dev：优先发现带实现细节、架构取舍、踩坑经验、评测方法、前后端工程实践或可复现实验的 AI 技术博客，跳过缺少技术细节的社交短帖。
- LangChain Blog、Simon Willison、GitHub Blog、Vercel Blog、Stack Overflow Blog：优先发现 AI 应用开发、大模型集成、Agent 工程、前后端开发、开发者工具和工程实践类长文。
- OpenAI、DeepMind、Hugging Face：补充官方模型、API、SDK、开源框架、评测和平台更新中对软件工程实践有直接影响的内容。

### 5. 部署平台

当前自托管服务器上的 PostgreSQL 不对公网开放。`publish-articles.yml` 不直接连接数据库，而是向线上站点的内部导入接口发送 Markdown 内容，由站点进程在服务器本地写入 PostgreSQL。

如果后续迁移到 Vercel 或其他自动部署平台，可以继续沿用 webhook 方式，只要目标环境能访问同一 PostgreSQL。

## 日常操作

手动生成 Codex issue 正文：

```bash
npm run news:codex-issue
```

手动触发定时 issue：

1. 打开 GitHub 仓库 `Actions`。
2. 选择 `Daily Codex News Request`。
3. 点击 `Run workflow`。

手动校验文章：

```bash
npm run articles:check
```

手动导入文章：

```bash
DATABASE_URL="postgresql://..." npm run articles:import
```

## 文章文件格式

Codex 生成的文件应放在 `content/articles/`，示例：

```markdown
---
title: "中文标题"
slug: "url-safe-slug"
summary: "100 字以内摘要"
category: "ai"
tags:
  - AI
  - 资讯
source: "https://original-source.example"
published: true
featured: false
createdAt: "2026-04-28T09:00:00.000+08:00"
---

正文使用 Markdown。
```
