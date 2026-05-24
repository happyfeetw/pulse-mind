import { readFile } from "node:fs/promises";
import { fetchAllNewsFeeds, NEWS_SOURCE_GUIDE } from "./lib/news";

const maxItems = Number(process.env.NEWS_MAX_ITEMS || "12");
const maxItemsPerSource = Number(process.env.NEWS_MAX_ITEMS_PER_SOURCE || "3");
const rssTimeoutMs = Number(process.env.NEWS_RSS_TIMEOUT_MS || "10000");
const articleLength = process.env.CODEX_NEWS_ARTICLE_LENGTH || "1200-1800 Chinese characters";
const targetDir = process.env.CODEX_NEWS_TARGET_DIR || "content/articles";
const promptPath = process.env.CODEX_NEWS_PROMPT_PATH || "docs/prompts/codex-ai-briefing.md";

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

function renderPrompt(
  template: string,
  values: Record<string, string>,
) {
  let rendered = template;

  for (const [key, value] of Object.entries(values)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  const missing = rendered.match(/{{[A-Z_]+}}/g);
  if (missing) {
    throw new Error(`Unresolved prompt placeholders: ${[...new Set(missing)].join(", ")}`);
  }

  return rendered;
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
  const template = await readFile(promptPath, "utf8");

  console.log(renderPrompt(template, {
    ARTICLE_LENGTH: articleLength,
    CANDIDATES: candidates,
    SOURCE_GUIDE: sourceGuide,
    TARGET_DIR: targetDir,
    TODAY: today,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
