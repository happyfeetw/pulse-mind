import { fetchAllNewsFeeds } from "./lib/news";

const maxItems = Number(process.env.NEWS_MAX_ITEMS || "8");
const rssTimeoutMs = Number(process.env.NEWS_RSS_TIMEOUT_MS || "10000");
const articleLength = process.env.CODEX_NEWS_ARTICLE_LENGTH || "900-1200 Chinese characters";
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
  const items = await fetchAllNewsFeeds({ maxItems, rssTimeoutMs });
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

  console.log(`@codex Please create today's PulseMind AI article as a pull request.

Date: ${today}

Requirements:
- Create exactly one Markdown article under \`${targetDir}/\`, named \`${today}-<short-slug>.md\`.
- Do not call external model APIs, do not write to the database, and do not edit unrelated files.
- Use Simplified Chinese.
- Target length: ${articleLength}.
- The article must be grounded in the source links below. Avoid unsupported claims.
- Keep the tone analytical, concise, and suitable for a personal technical blog.
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

Candidate sources:

${candidates}
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
