import Parser from "rss-parser";

export interface RssSource {
  name: string;
  url: string;
  alwaysRelevant?: boolean;
}

export interface NewsItem {
  title: string;
  link: string;
  content: string;
  publishedAt: Date;
  source: string;
}

interface FetchNewsOptions {
  lookbackHours?: number;
  maxItems?: number;
  maxItemsPerSource?: number;
  rssTimeoutMs?: number;
}

const RSS_SOURCES: RssSource[] = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", alwaysRelevant: true },
  { name: "Hacker News AI", url: "https://news.ycombinator.com/rss" },
  { name: "Hacker News LLM Search", url: "https://hnrss.org/newest?q=LLM" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", alwaysRelevant: true },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", alwaysRelevant: true },
  { name: "QbitAI", url: "https://qbitai.com/feed", alwaysRelevant: true },
  { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml", alwaysRelevant: true },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "LangChain Blog", url: "https://blog.langchain.com/rss.xml" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
  { name: "GitHub Blog", url: "https://github.blog/feed/" },
  { name: "Vercel Blog", url: "https://vercel.com/blog/rss.xml" },
  { name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/" },
  { name: "BestBlogs.dev", url: "https://www.bestblogs.dev/en/feeds/rss" },
  { name: "arXiv cs.AI", url: "http://arxiv.org/rss/cs.AI", alwaysRelevant: true },
  { name: "arXiv cs.CL", url: "http://arxiv.org/rss/cs.CL" },
];

export const NEWS_SOURCE_GUIDE = [
  "Hacker News: 优先选全球工程师、创业者正在讨论的 AI 应用、大模型、coding-agent、开源项目、前后端开发工具和技术争议；跳过只有情绪或八卦价值的讨论。",
  "Hacker News LLM Search: 补充 HN 最新提交中的 LLM、AI 应用、coding-agent、开发者工具和工程实践讨论，优先选指向 GitHub、技术博客、论文或可试用工具的条目。",
  "The Verge AI: 只在产品、安全、平台政策或行业争议对 AI 应用开发、模型集成、数据使用、权限边界、用户体验设计有工程启发时采用；跳过纯消费产品评论。",
  "TechCrunch AI: 只在创业产品、平台、API、SDK、基础设施、定价、部署方式或商业化路径对开发者有参考价值时采用；跳过纯融资新闻和硬件体验文。",
  "QbitAI: 优先选国内外模型、Agent、框架、论文、工程实践、开发者工具、前后端 AI 应用案例的技术细节；跳过只有公司动态或热闹标题的内容。",
  "arXiv cs.AI/cs.CL: 重点抓可复用的方法、评测、限制和潜在工程影响；只选会影响 AI 应用、coding-agent、RAG、推理、模型部署或开发工具的论文。",
  "BestBlogs.dev: 优先选工程师、研究员和创业者的高质量 AI 技术博客，尤其是带实现细节、架构取舍、踩坑经验、评测方法、前后端工程实践或可复现实验的长文；跳过缺少技术细节的社交短帖。",
  "LangChain Blog、Simon Willison、GitHub Blog、Vercel Blog、Stack Overflow Blog: 优先选 AI 应用开发、大模型集成、Agent 工程、前后端开发、开发者工具和工程实践类长文。",
  "OpenAI、DeepMind、Hugging Face: 优先选官方模型、API、SDK、开源框架、评测和平台更新中对软件工程实践有直接影响的内容。",
];

const AI_KEYWORD_PATTERNS = [
  /\bai\b/i,
  /artificial intelligence/i,
  /machine learning/i,
  /deep learning/i,
  /\bllm\b/i,
  /language model/i,
  /openai/i,
  /anthropic/i,
  /deepmind/i,
  /hugging face/i,
  /\bllama\b/i,
  /transformer/i,
  /neural/i,
  /\bagent\b/i,
  /inference/i,
  /arxiv/i,
  /人工智能/,
  /机器学习/,
  /深度学习/,
  /大模型/,
  /语言模型/,
  /智能体/,
  /推理/,
  /多模态/,
  /生成式/,
  /开源模型/,
  /模型训练/,
  /模型部署/,
];

const STRICT_AI_KEYWORD_PATTERNS = AI_KEYWORD_PATTERNS.filter(
  (pattern) => pattern.source !== "\\bai\\b",
);

const ENGINEERING_KEYWORD_PATTERNS = [
  /\bapp\b/i,
  /application/i,
  /\bllm\b/i,
  /\bmodels?\b/i,
  /model platform/i,
  /model api/i,
  /software engineer/i,
  /developer/i,
  /frontend/i,
  /front-end/i,
  /backend/i,
  /back-end/i,
  /full-stack/i,
  /coding/i,
  /code review/i,
  /test generation/i,
  /react/i,
  /next\\.js/i,
  /nextjs/i,
  /vue/i,
  /svelte/i,
  /node\\.js/i,
  /nodejs/i,
  /typescript/i,
  /javascript/i,
  /python/i,
  /java/i,
  /golang/i,
  /\bgo\b/i,
  /rust/i,
  /rails/i,
  /database/i,
  /postgres/i,
  /mysql/i,
  /redis/i,
  /\bide\b/i,
  /\bsdk\b/i,
  /\bapi\b/i,
  /\bmcp\b/i,
  /\brag\b/i,
  /\bevals?\b/i,
  /benchmark/i,
  /open source/i,
  /github/i,
  /tool use/i,
  /browser agent/i,
  /web agent/i,
  /agent/i,
  /inference/i,
  /latency/i,
  /serving/i,
  /deployment/i,
  /observability/i,
  /orchestration/i,
  /workflow/i,
  /debugging/i,
  /security/i,
  /prompt injection/i,
  /jailbreak/i,
  /data leakage/i,
  /supply chain/i,
  /permission/i,
  /应用开发/,
  /应用/,
  /大模型/,
  /模型/,
  /软件工程/,
  /工程师/,
  /开发者/,
  /前端/,
  /后端/,
  /全栈/,
  /编程/,
  /代码/,
  /代码审查/,
  /测试生成/,
  /测试/,
  /调试/,
  /开发工具/,
  /开发者工具/,
  /开源/,
  /框架/,
  /基准/,
  /评测/,
  /工具调用/,
  /智能体/,
  /浏览器智能体/,
  /推理成本/,
  /推理延迟/,
  /部署/,
  /可观测/,
  /编排/,
  /工作流/,
  /提示注入/,
  /越狱/,
  /数据泄露/,
  /供应链/,
  /权限边界/,
  /安全/,
];

const BROAD_MEDIA_SOURCES = new Set(["The Verge AI", "TechCrunch AI"]);

const ENGINEERING_SOURCE_WEIGHTS = new Map<string, number>([
  ["BestBlogs.dev", 4],
  ["Hacker News AI", 3],
  ["Hacker News LLM Search", 4],
  ["Hugging Face", 3],
  ["LangChain Blog", 4],
  ["Simon Willison", 4],
  ["GitHub Blog", 3],
  ["Vercel Blog", 3],
  ["Stack Overflow Blog", 3],
  ["OpenAI", 2],
  ["DeepMind", 2],
  ["arXiv cs.AI", 2],
  ["arXiv cs.CL", 2],
  ["QbitAI", 1],
]);

const LOW_SIGNAL_PATTERNS = [
  /\/status\//,
  /\/video\//,
  /wearable/i,
  /hardware/i,
  /funding/i,
  /raises? \$?/i,
  /valuation/i,
  /融资/,
  /估值/,
  /可穿戴/,
  /硬件体验/,
];

export function formatError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAiRelevant(item: NewsItem) {
  const source = RSS_SOURCES.find((rssSource) => rssSource.name === item.source);

  if (source?.alwaysRelevant) {
    return true;
  }

  const text = `${item.title} ${item.content}`;
  if (item.source === "BestBlogs.dev") {
    return STRICT_AI_KEYWORD_PATTERNS.some((pattern) => pattern.test(text));
  }

  return AI_KEYWORD_PATTERNS.some((pattern) => pattern.test(text));
}

function hasEngineeringSignal(item: NewsItem) {
  const text = `${item.title} ${item.content}`;
  return ENGINEERING_KEYWORD_PATTERNS.some((pattern) => pattern.test(text));
}

function isLowSignalItem(item: NewsItem) {
  if (item.source === "BestBlogs.dev" && /\/status\//.test(item.link)) {
    return true;
  }

  if (
    (item.source === "Hacker News AI" || item.source === "Hacker News LLM Search") &&
    !hasEngineeringSignal(item)
  ) {
    return true;
  }

  if (BROAD_MEDIA_SOURCES.has(item.source) && !hasEngineeringSignal(item)) {
    return true;
  }

  const text = `${item.title} ${item.content} ${item.link}`;
  return LOW_SIGNAL_PATTERNS.some((pattern) => pattern.test(text)) && !hasEngineeringSignal(item);
}

function getEngineeringRelevanceScore(item: NewsItem) {
  const text = `${item.title} ${item.content}`;
  const keywordScore = ENGINEERING_KEYWORD_PATTERNS.reduce(
    (score, pattern) => score + (pattern.test(text) ? 1 : 0),
    0,
  );
  const sourceWeight = ENGINEERING_SOURCE_WEIGHTS.get(item.source) ?? 0;
  const contentScore = item.content.length >= 350 ? 2 : item.content.length >= 180 ? 1 : 0;

  return keywordScore > 0 ? sourceWeight + keywordScore + contentScore : Math.min(sourceWeight, 1);
}

function dedupeNewsItems(items: NewsItem[]) {
  const seen = new Set<string>();
  const deduped: NewsItem[] = [];

  for (const item of items) {
    const key = item.link.replace(/[#?].*$/, "").replace(/\/$/, "");
    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

async function parseFeed(source: RssSource, rssTimeoutMs: number) {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "PulseMind News Fetcher/1.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    signal: AbortSignal.timeout(rssTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Status code ${response.status}`);
  }

  const parser = new Parser();
  return parser.parseString(await response.text());
}

async function fetchSource(source: RssSource, rssTimeoutMs: number): Promise<NewsItem[]> {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const feed = await parseFeed(source, rssTimeoutMs);
      const items: NewsItem[] = [];

      for (const item of feed.items.slice(0, 10)) {
        const title = item.title?.trim();
        const link = item.link?.trim();
        const content = item.contentSnippet || item.content || item.summary;

        if (!title || !link || !content) continue;

        items.push({
          title,
          link,
          content: content.trim(),
          publishedAt: new Date(item.isoDate || item.pubDate || Date.now()),
          source: source.name,
        });
      }

      return items;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`Failed to fetch ${source.name}: ${formatError(error)}`);
      } else {
        await sleep(500 * attempt);
      }
    }
  }

  return [];
}

export async function fetchAllNewsFeeds(options: FetchNewsOptions = {}): Promise<NewsItem[]> {
  const lookbackHours = options.lookbackHours;
  const maxItems = options.maxItems ?? 5;
  const maxItemsPerSource = options.maxItemsPerSource ?? 3;
  const rssTimeoutMs = options.rssTimeoutMs ?? 10000;
  const since =
    lookbackHours && lookbackHours > 0 ? Date.now() - lookbackHours * 60 * 60 * 1000 : null;
  const results = await Promise.all(RSS_SOURCES.map((source) => fetchSource(source, rssTimeoutMs)));
  const items = results.flatMap((itemsForSource) =>
    itemsForSource
      .filter(isAiRelevant)
      .filter((item) => !isLowSignalItem(item))
      .filter((item) => !since || item.publishedAt.getTime() >= since)
      .sort(
        (a, b) =>
          getEngineeringRelevanceScore(b) - getEngineeringRelevanceScore(a) ||
          b.publishedAt.getTime() - a.publishedAt.getTime(),
      )
      .slice(0, maxItemsPerSource),
  );

  return dedupeNewsItems(
    items.sort(
      (a, b) =>
        getEngineeringRelevanceScore(b) - getEngineeringRelevanceScore(a) ||
        b.publishedAt.getTime() - a.publishedAt.getTime(),
    ),
  )
    .slice(0, maxItems);
}
