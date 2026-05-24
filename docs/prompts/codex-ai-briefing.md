@codex Please create today's PulseMind AI engineering briefing as a pull request.

Date: {{TODAY}}

Goal:
Create a high-signal Chinese AI engineering briefing for software engineers. It should help readers quickly understand the latest AI developments that affect how engineers build, ship, operate, evaluate, and secure software.

Focus areas:
- AI coding agents, IDEs, code review, test generation, and developer workflows
- Agent engineering, MCP, tool use, browser/web agents, RAG, memory, evals, observability, and orchestration
- Model serving, inference cost, latency, deployment, model routing, and production reliability
- Open-source AI frameworks, SDKs, APIs, benchmarks, and engineering case studies
- Security issues engineers must understand, such as prompt injection, jailbreaks, data leakage, supply chain risk, and permission boundaries
- Research only when it has plausible engineering impact within 6-12 months

Audience:
Chinese software engineers, engineering managers, technical founders, and AI application builders. They care about practical technical signal: what changed, what is worth trying, what risk to watch, and what engineering idea can be reused. They do not want general AI business news, consumer product commentary, funding summaries, or broad industry trend essays unless there is a direct engineering implication.

Task:
Create exactly one Markdown article under `{{TARGET_DIR}}/`, named:
`{{TODAY}}-<short-slug>.md`

Only edit `{{TARGET_DIR}}/**/*.md`.

Language:
Use Simplified Chinese.

Length:
{{ARTICLE_LENGTH}}.

Article type:
This is an AI engineering briefing / curated technical digest, not a broad opinion essay, company news roundup, funding digest, or press release rewrite.

Source selection:
- Candidate sources are roughly pre-ranked by software-engineering relevance first and recency second. Treat the order as a hint, not as proof of quality.
- Select 2 to 4 items from the candidate sources.
- Select fewer items if only a few are genuinely relevant to software engineers.
- Prefer a coherent technical thread over broad coverage. Do not write a scattered roundup.
- Do not include a source only because the company is famous.
- Include a source only if a software engineer can learn at least one of the following:
  - a tool, API, framework, SDK, benchmark, or architecture worth trying
  - a production engineering lesson about reliability, cost, latency, evals, observability, safety, or deployment
  - a concrete workflow change for coding, testing, review, debugging, documentation, or operations
  - a security or governance risk that changes how engineers should design AI systems
  - a research result that points to an implementable technique or near-term platform shift
- Deprioritize or skip:
  - consumer AI product reviews without engineering detail
  - funding, IPO, or valuation news without technical substance
  - company strategy stories without developer impact
  - sensational controversy without an engineering lesson
  - vague "AI changes everything" commentary

Required article structure:
1. Opening paragraph:
   - Briefly state the engineering thread tying the selected items together.
   - Do not make grand claims like "AI is entering a new era".
2. Main sections:
   - Use 2 to 4 short sections.
   - Each section covers exactly one selected item.
   - Each section must answer:
     - What happened?
     - What is the engineering detail?
     - Why should software engineers care?
     - What should readers try, monitor, avoid, or read next?
3. Closing paragraph:
   - Summarize the actionable engineering signal for readers.
   - Do not end with generic optimism.

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
- Write like an informed engineering editor, not a marketing writer or industry analyst.
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
- Every paragraph should contain at least one specific fact, tool, company, product, metric, scenario, engineering practice, or research result.
- Every main section should end with a concrete takeaway for engineers.

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
  - "AI 工程简报：Webwright、AWS MCP 与 Agent 安全边界"
  - "软件工程师 AI 简报：浏览器智能体、MCP 治理与推理成本"

Source guide:
{{SOURCE_GUIDE}}

Self-review before opening the PR:
- Is this clearly written for software engineers?
- Are 2 to 4 selected items technically relevant rather than merely newsworthy?
- Is there a coherent engineering thread instead of a scattered roundup?
- Does each selected item have a practical engineering takeaway?
- Are all factual claims grounded in the provided sources?
- Did it avoid generic trend commentary?
- Did it avoid marketing language?
- Did it only edit `{{TARGET_DIR}}/**/*.md`?
- If the result reads like a generic AI news roundup or business trend essay, revise it before opening the PR. The final article should feel like a curated technical briefing written by an engineering editor.

Validation:
Run:
- `npm run articles:check`
- `npm run lint`
- `npm run build`

Candidate sources:
{{CANDIDATES}}
