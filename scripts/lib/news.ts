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
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", alwaysRelevant: true },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", alwaysRelevant: true },
  { name: "QbitAI", url: "https://qbitai.com/feed", alwaysRelevant: true },
  { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml", alwaysRelevant: true },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "BestBlogs.dev", url: "https://www.bestblogs.dev/en/feeds/rss" },
  { name: "arXiv cs.AI", url: "http://arxiv.org/rss/cs.AI", alwaysRelevant: true },
  { name: "arXiv cs.CL", url: "http://arxiv.org/rss/cs.CL" },
];

export const NEWS_SOURCE_GUIDE = [
  "Hacker News: 看全球工程师、创业者正在讨论的新工具、新论文、新产品和技术争议。",
  "The Verge AI: 关注 AI 产品、公司动态、行业争议、科技趋势，以及 AI 对普通用户和商业世界的影响。",
  "TechCrunch AI: 偏创业、融资、产品和公司层面，适合观察 AI 创业方向、资本关注点和新公司动态。",
  "QbitAI: 中文 AI 前沿资讯入口，适合跟进国内外模型、应用、论文和公司动态。",
  "arXiv cs.AI/cs.CL: 更接近技术源头，用摘要、方法、实验和结论抓研究重点。",
  "BestBlogs.dev: 发现高质量技术博客，补充新闻之外的工程师、研究员和创业者长文经验。",
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
      .filter((item) => !since || item.publishedAt.getTime() >= since)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, maxItemsPerSource),
  );

  return items
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, maxItems);
}
