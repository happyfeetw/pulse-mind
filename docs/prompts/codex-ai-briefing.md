@codex Please create today's PulseMind AI briefing as a pull request.

Date: {{TODAY}}

Goal:
Create a high-signal Chinese AI briefing that helps readers quickly understand the latest, most useful, and highest-quality AI developments across:
- Global and Chinese AI news
- Real-world AI engineering practices in companies and industries
- Practical AI tools, products, workflows, and developer platforms
- Research or paper signals that may affect products, engineering, or industry direction

Audience:
Chinese readers who care about AI products, engineering practice, developer tools, startups, and industry adoption. They do not want generic AI hype. They want concise, useful, source-grounded information that helps them decide what to read, try, or pay attention to.

Task:
Create exactly one Markdown article under `{{TARGET_DIR}}/`, named:
`{{TODAY}}-<short-slug>.md`

Only edit `{{TARGET_DIR}}/**/*.md`.

Language:
Use Simplified Chinese.

Length:
{{ARTICLE_LENGTH}}.

Article type:
This is an AI briefing / curated digest, not a broad opinion essay and not a press release rewrite.

Source selection:
- Select 3 to 5 items from the candidate sources.
- Do not force all sources into one abstract theme.
- Do not include a source only because the company is famous.
- Prioritize sources with concrete usefulness:
  - new AI products, tools, models, or developer platforms
  - engineering practices with measurable outcomes
  - real company or industry AI adoption cases
  - startup, funding, product, or market signals
  - infrastructure, evaluation, safety, provenance, deployment, or workflow changes
  - research papers with practical product or engineering implications
- If a source is weak, repetitive, sensational, or lacks concrete information, skip it.

Required article structure:
1. Opening paragraph:
   - Briefly state what today's briefing covers.
   - Do not make grand claims like "AI is entering a new era".
2. Main sections:
   - Use 3 to 5 short sections.
   - Each section covers exactly one selected item.
   - Each section must answer:
     - What happened?
     - Why does it matter?
     - Who should care?
     - What is the practical takeaway?
3. Closing paragraph:
   - Summarize the actionable signal for readers.
   - Do not end with generic optimism.

Source grounding:
- Use only the candidate sources provided below.
- Each selected item must include a Markdown link to the source in the body.
- Do not invent facts not present in the provided title, snippet, or accessible source page.
- If the source page is unavailable or unclear, do not use that item.
- Prefer concrete facts over interpretation.
- When discussing research, focus on the problem, method, result, limitation, and possible practical impact.

Style:
- Clear, concise, editorial.
- Write like an informed technical editor, not a marketing writer.
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
  - "今日 AI 简报：AWS MCP、Google 搜索 AI 与视频生成工具"
  - "AI 工程实践观察：MCP、RAG 评测与企业落地案例"

Source guide:
{{SOURCE_GUIDE}}

Self-review before opening the PR:
- Does this help readers quickly understand useful AI developments?
- Are 3 to 5 items clearly separated?
- Does each selected item have a practical takeaway?
- Are all factual claims grounded in the provided sources?
- Did it avoid generic trend commentary?
- Did it avoid marketing language?
- Did it only edit `{{TARGET_DIR}}/**/*.md`?
- If the result reads like a generic trend essay, revise it before opening the PR. The final article should feel like a curated briefing written by a technical editor.

Validation:
Run:
- `npm run articles:check`
- `npm run lint`
- `npm run build`

Candidate sources:
{{CANDIDATES}}
