import { fetchAllNewsFeeds, NEWS_SOURCE_GUIDE } from "./lib/news";

const maxItems = Number(process.env.NEWS_MAX_ITEMS || "12");
const maxItemsPerSource = Number(process.env.NEWS_MAX_ITEMS_PER_SOURCE || "3");
const rssTimeoutMs = Number(process.env.NEWS_RSS_TIMEOUT_MS || "10000");
const articleLength = process.env.CODEX_NEWS_ARTICLE_LENGTH || "1200-1800 Chinese characters";
const targetDir = process.env.CODEX_NEWS_TARGET_DIR || "content/articles";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeSnippet(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 700);
}

async function main() {
  const today = formatDate(new Date());
  const items = await fetchAllNewsFeeds({ maxItems, maxItemsPerSource, rssTimeoutMs });
  const candidates =
    items.length > 0
      ? items
          .map(
            (item, index) => `### ${index + 1}. ${item.title}
- Source: ${item.source}
- Published: ${item.publishedAt.toISOString()}
- URL: ${item.link}
- Snippet: ${normalizeSnippet(item.content)}
`,
          )
          .join("\n")
      : "No RSS candidates were found today. If you proceed, use reputable public AI sources and include source links.";
  const sourceGuide = NEWS_SOURCE_GUIDE.map((item) => `- ${item}`).join("\n");

  console.log(`@codex Please create today's PulseMind AI briefing as a pull request.

Date: ${today}

Goal:
Create a high-signal Chinese AI briefing that helps readers quickly understand the latest, most useful, and highest-quality AI developments across:
- Global and Chinese AI news
- Real-world AI engineering practices in companies and industries
- Practical AI tools, products, workflows, and developer platforms

Audience:
Chinese readers who care about AI products, engineering practice, developer tools, and industry adoption. They are not looking for generic AI hype. They want concise, useful, source-grounded information.

Requirements:
- Create exactly one Markdown article under \`${targetDir}/\`, named \`${today}-<short-slug>.md\`.
- Do not call external model APIs, do not write to the database, and do not edit unrelated files.
- Use Simplified Chinese.
- Target length: ${articleLength}.
- This is an AI briefing / curated digest, not a broad opinion essay.
- Select 3 to 5 items from the candidate sources.
- Do not force all sources into one abstract theme.
- Prioritize concrete usefulness: new products/tools, model releases, engineering practices, industry adoption, infrastructure, evaluation, safety, provenance, deployment, or capital/startup signals.
- Each selected item must answer: what happened, why it matters, who should care, and the practical takeaway.
- Each selected item must include a Markdown link to the source in the body.
- Do not invent details not present in the provided title/snippet/source link.
- Avoid generic trend commentary and marketing language.
- Avoid empty abstractions such as "赋能", "生态闭环", "底层逻辑", "范式转移", "从工具到基础设施", "更可用、更可管、更可扩".
- Include frontmatter with this shape:

\`\`\`yaml
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
createdAt: "${today}T09:00:00.000+08:00"
---
\`\`\`

Validation before opening the PR:
- \`npm run articles:check\`
- \`npm run lint\`
- \`npm run build\`

Source guide:
${sourceGuide}

Required structure:
1. Opening paragraph: briefly state what today's briefing covers. Do not make grand claims.
2. Main sections: 3 to 5 short sections, one selected item per section.
3. Closing paragraph: summarize the actionable signal for readers without generic optimism.

Self-review before opening the PR:
- Does it help readers quickly understand useful AI developments?
- Are 3 to 5 items clearly separated?
- Does each item include a practical takeaway?
- Is every factual claim grounded in the provided sources?
- Did it avoid generic trend commentary?
- Did it only edit \`content/articles/**/*.md\`?

Candidate sources:

${candidates}
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
