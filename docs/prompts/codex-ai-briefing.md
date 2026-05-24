@codex Please create today's PulseMind software-engineer AI radar as a pull request.

Date: {{TODAY}}

Goal:
Create a high-signal Chinese curated digest for software engineers. It should collect, organize, and publish AI-related news, technical blogs, tools, papers, and engineering practice that software engineers would actually want to open, read, try, or track.

Focus areas:
- AI application development: RAG, agents, tool use, MCP, memory, evals, observability, orchestration, prompt engineering, AI product architecture
- Large models and model platforms: model releases, APIs, SDKs, inference cost, latency, deployment, routing, fine-tuning, multimodal capabilities
- Coding agents and developer tools: IDE agents, code generation, code review, test generation, debugging, documentation, CI/CD, browser/web agents
- Frontend and backend development: React, Next.js, Vue, Svelte, Node.js, Python, Go, Java, Rust, databases, APIs, cloud, DevOps, and architecture when the item helps engineers build software better
- Open-source projects, technical blogs, benchmarks, engineering case studies, implementation notes, and postmortems
- Security and governance engineers need to understand: prompt injection, jailbreaks, data leakage, supply chain risk, permission boundaries, auditability
- Research only when it includes a method, benchmark, limitation, or result that application engineers can learn from

Audience:
Chinese software engineers, engineering managers, technical founders, and AI application builders. They care about practical technical signal: what changed, what is worth reading, what is worth trying, what risk to watch, and what engineering idea can be reused. They do not want general AI business news, consumer product commentary, funding summaries, or broad industry trend essays unless there is a direct engineering implication.

Task:
Create exactly one Markdown article under `{{TARGET_DIR}}/`, named:
`{{TODAY}}-<short-slug>.md`

Only edit `{{TARGET_DIR}}/**/*.md`.

Language:
Use Simplified Chinese.

Length:
{{ARTICLE_LENGTH}}.

Article type:
This is a software-engineer AI radar / curated reading digest, not a single-theme essay, broad opinion article, company news roundup, funding digest, or press release rewrite.

Source selection:
- Candidate sources are roughly pre-ranked by software-engineering relevance first and recency second. Treat the order as a hint, not as proof of quality.
- Select 4 to 7 items from the candidate sources.
- Select fewer items if only a few are genuinely useful to software engineers.
- Do not force all selected items into one theme. It is acceptable and preferred to publish a curated list across AI application development, large models, coding agents, frontend, and backend engineering.
- The final result must feel like a hand-curated engineering reading list, not a synthetic industry analysis essay.
- Do not include a source only because the company is famous.
- Prefer items that satisfy at least one of the following:
  - a tool, API, framework, SDK, benchmark, library, repo, tutorial, or architecture worth trying
  - a technical blog or case study with implementation detail, tradeoff, metric, failure mode, or reproducible lesson
  - a concrete workflow change for frontend/backend development, coding, testing, review, debugging, documentation, CI/CD, or operations
  - a production engineering lesson about reliability, cost, latency, evals, observability, safety, data, deployment, or model routing
  - a security or governance risk that changes how engineers should design AI applications or agent systems
  - a model, paper, or benchmark that changes how engineers should evaluate, deploy, or integrate LLMs
- Deprioritize or skip:
  - consumer AI product reviews without engineering detail
  - funding, IPO, or valuation news without technical substance
  - company strategy stories without developer impact
  - sensational controversy without an engineering lesson
  - vague "AI changes everything" commentary
  - one-sentence social posts unless they point to a concrete tool, repo, metric, production constraint, or developer workflow

Required article structure:
1. Curated items:
   - Start directly with the first curated item after the frontmatter.
   - Do not write an opening paragraph, editor's note, column note, format explanation, or transition paragraph.
   - Use 4 to 7 short sections.
   - Each section covers exactly one selected item.
   - Start each section title with one label from:
     - `AI 应用`
     - `大模型`
     - `Coding Agent`
     - `前端/后端`
     - `工具/开源`
     - `安全/治理`
   - Each section must answer:
     - What is the item? Include a Markdown link.
     - What is the useful technical detail?
     - Why should software engineers care?
     - What should readers read, try, monitor, or avoid next?
2. No closing summary:
   - Do not add a closing paragraph.
   - End after the final curated item and its engineering takeaway.

Source grounding:
- Use only the candidate sources provided below.
- Each selected item must include a Markdown link to the source in the body.
- Do not invent facts not present in the provided title, snippet, or accessible source page.
- If the source page is unavailable or unclear, do not use that item.
- Prefer concrete facts over interpretation.
- When discussing research, focus on the problem, method, result, limitation, and possible practical impact.
- If a source lacks enough technical detail, say less about it or skip it.

Style:
- Clear, concise, editorial.
- Write like a senior software engineer curating useful links for other engineers, not like a marketing writer or industry analyst.
- Do not include meta commentary about the article format, editorial intent, issue window, source selection, or what the article is not.
- Do not use phrases such as:
  - 这期雷达
  - 本期雷达
  - 本文覆盖
  - 下面不是
  - 这不是
  - 可读、可试、可跟进
  - 工程清单
  - 本文/本篇/这篇文章
- Use engineering vocabulary only when it clarifies the point. Avoid jargon-padding.
- Avoid hype, slogans, and vague abstractions.
- Avoid these phrases unless backed by concrete facts:
  - 赋能
  - 生态闭环
  - 底层逻辑
  - 范式转移
  - 从工具到基础设施
  - 更可用、更可管、更可扩
  - 重塑行业
  - 引领未来
- Avoid listing company names without explaining the concrete value.
- Every item should contain at least one specific fact, tool, repo, framework, product, metric, scenario, engineering practice, or research result.
- Every item should end with a concrete takeaway for engineers.

Frontmatter:
Use this shape:

```yaml
---
title: "中文标题"
slug: "url-safe-slug"
summary: "100 字以内摘要"
category: "ai"
tags:
  - AI
  - 资讯
source: "primary-source-url"
published: true
featured: false
createdAt: "{{TODAY}}T09:00:00.000+08:00"
---
```

Title requirements:
- The title should describe the briefing's actual content.
- Avoid vague titles like "AI 行业正在发生变化".
- Prefer concrete titles, for example:
  - "软件工程师 AI 雷达：Coding Agent、MCP 与前后端开发"
  - "AI 技术雷达：大模型 API、Agent 工程与开发者工具"

Source guide:
{{SOURCE_GUIDE}}

Self-review before opening the PR:
- Is this clearly written for software engineers?
- Does it select 4 to 7 useful items, or fewer only when the source pool is weak?
- Does it cover practical software-engineering interests, especially AI applications, large models, coding agents, frontend, or backend development?
- Does it read like a curated engineering reading digest rather than a forced single-theme essay?
- Does it start directly with the first item and avoid all meta commentary about the article format?
- Does each selected item have a practical engineering takeaway?
- Are all factual claims grounded in the provided sources?
- Did it avoid generic trend commentary?
- Did it avoid marketing language?
- Did it only edit `{{TARGET_DIR}}/**/*.md`?
- If the result reads like a generic AI news roundup, business trend essay, or abstract agent-safety essay, revise it before opening the PR. The final article should feel like a useful technical reading list for software engineers.

Validation:
Run:
- `npm run articles:check`
- `npm run lint`
- `npm run build`

Candidate sources:
{{CANDIDATES}}
