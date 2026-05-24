import prisma from "../src/lib/prisma";
import { slugify } from "../src/lib/utils";
import { fetchAllNewsFeeds, formatError, type NewsItem } from "./lib/news";

interface RewriteResult {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
  };
}

interface OpenAIRequestBody {
  model: string;
  input: string;
  max_output_tokens: number;
  reasoning?: {
    effort: string;
  };
}

const rssTimeoutMs = Number(process.env.NEWS_RSS_TIMEOUT_MS || "10000");
const dryRun = process.argv.includes("--dry-run");
const lookbackHours = Number(process.env.NEWS_LOOKBACK_HOURS || "8");
const maxItems = Number(process.env.NEWS_MAX_ITEMS || "5");
const maxItemsPerSource = Number(process.env.NEWS_MAX_ITEMS_PER_SOURCE || "3");
const shouldPublish = process.env.PUBLISH_NEWS !== "false";
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || "gpt-5.5";
const openaiReasoningEffort = process.env.OPENAI_REASONING_EFFORT || "medium";
const openaiMaxOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || "2400");
const openaiTimeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || "120000");
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getOpenAIOutputText(data: OpenAIResponse): string | undefined {
  if (data.output_text) return data.output_text;

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) return content.text;
    }
  }

  return undefined;
}

function extractJson(text: string): RewriteResult | null {
  const jsonText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonText) as Partial<RewriteResult>;

    if (!parsed.title || !parsed.summary || !parsed.content) {
      return null;
    }

    return {
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.content,
      tags: Array.isArray(parsed.tags) ? parsed.tags : ["AI", "资讯"],
    };
  } catch {
    return null;
  }
}

async function rewriteWithOpenAI(news: NewsItem): Promise<RewriteResult> {
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const prompt = `你是一个专业的科技资讯编辑。请将以下 AI 资讯重写为适合 PulseMind 发布的中文文章。

要求:
1. 使用简体中文，避免直译腔。
2. 标题准确、克制，不夸张。
3. 正文 500 字以上，使用 Markdown。
4. 摘要 100 字以内。
5. 保留原文链接。
6. 只输出 JSON，不要输出 Markdown 代码块之外的解释。

JSON 格式:
{
  "title": "中文标题",
  "summary": "100字以内摘要",
  "content": "Markdown 正文，末尾包含原文链接",
  "tags": ["AI", "资讯"]
}

原文标题: ${news.title}
来源: ${news.source}
原文链接: ${news.link}
发布时间: ${news.publishedAt.toISOString()}

原文内容:
${news.content.slice(0, 2500)}`;

  const requestBody: OpenAIRequestBody = {
    model: openaiModel,
    input: prompt,
    max_output_tokens: openaiMaxOutputTokens,
  };

  if (openaiReasoningEffort !== "none") {
    requestBody.reasoning = { effort: openaiReasoningEffort };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(openaiTimeoutMs),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as OpenAIErrorResponse | null;
    const message = errorData?.error?.message || response.statusText;
    throw new Error(`OpenAI request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  const content = getOpenAIOutputText(data);

  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  const rewritten = extractJson(content);
  if (!rewritten) {
    throw new Error("OpenAI returned unparsable JSON");
  }

  return rewritten;
}

async function createUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || `ai-news-${Date.now()}`;
  let slug = base;
  let suffix = 1;

  while (await prisma.article.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

async function publishArticle(news: NewsItem, rewritten: RewriteResult) {
  const existing = await prisma.article.findFirst({
    where: { source: news.link },
    select: { id: true },
  });

  if (existing) {
    console.log(`Skip existing: ${news.title}`);
    return;
  }

  const slug = await createUniqueSlug(rewritten.title);

  await prisma.article.create({
    data: {
      title: rewritten.title,
      slug,
      summary: rewritten.summary,
      content: rewritten.content,
      category: "ai",
      tags: rewritten.tags,
      source: news.link,
      featured: false,
      published: shouldPublish,
    },
  });

  console.log(`Published: ${rewritten.title}`);
}

async function main() {
  const items = await fetchAllNewsFeeds({
    lookbackHours,
    maxItems,
    maxItemsPerSource,
    rssTimeoutMs,
  });
  console.log(`Fetched ${items.length} candidate items`);

  if (dryRun) {
    for (const item of items) {
      console.log(`- [${item.source}] ${item.title}`);
    }
    return;
  }

  for (const item of items) {
    try {
      console.log(`Processing: ${item.title}`);
      const rewritten = await rewriteWithOpenAI(item);
      await publishArticle(item, rewritten);
      await sleep(1500);
    } catch (error) {
      console.error(`Failed to process ${item.title}: ${formatError(error)}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(formatError(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
