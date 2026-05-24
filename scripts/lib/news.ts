import Parser from "rss-parser";

export interface RssSource {
  name: string;
  url: string;
}

export interface NewsItem {
  title: string;
  link: string;
  content: string;
  publishedAt: Date;
  source: string;
}

interface FetchNewsOptions {
  maxItems?: number;
  rssTimeoutMs?: number;
}

const RSS_SOURCES: RssSource[] = [
  { name: "OpenAI", url: "https://openai.com/news/rss.xml" },
  { name: "Hacker News AI", url: "https://news.ycombinator.com/rss" },
  { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "arXiv cs.AI", url: "http://arxiv.org/rss/cs.AI" },
  { name: "arXiv cs.CL", url: "http://arxiv.org/rss/cs.CL" },
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
  if (
    item.source.startsWith("arXiv") ||
    item.source === "DeepMind" ||
    item.source === "OpenAI"
  ) {
    return true;
  }

  const text = `${item.title} ${item.content}`;
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
  const maxItems = options.maxItems ?? 5;
  const rssTimeoutMs = options.rssTimeoutMs ?? 10000;
  const results = await Promise.all(RSS_SOURCES.map((source) => fetchSource(source, rssTimeoutMs)));
  const items = results.flat();

  return items
    .filter(isAiRelevant)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, maxItems);
}
