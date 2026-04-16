# AI 资讯每日采集与重写 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 每天早上 9 点自动从 AI 公司官方渠道采集资讯，由 AI 用中文（信达雅）重写后发布到网站。

**Architecture:** 使用 GitHub Actions 定时触发 Node.js 脚本，采集官方 RSS 源，通过 MiniMax API 重写内容后存入 PostgreSQL。

**Tech Stack:** Node.js, rss-parser, MiniMax API, Prisma, GitHub Actions

---

## Chunk 1: 项目基础设置

**Files:**
- Create: `scripts/fetch-ai-news.ts`
- Create: `.env.example` (update)
- Modify: `package.json`
- Create: `.github/workflows/daily-news.yml`

- [ ] **Step 1: 安装依赖**

```bash
npm install rss-parser
npm install -D @types/node tsx
```

- [ ] **Step 2: 确认 MiniMax API 环境变量**

在 `.env.example` 中添加:
```bash
MINIMAX_API_KEY="your-minimax-api-key"
MINIMAX_GROUP_ID="your-minimax-group-id"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add rss-parser and tsx for news fetcher"
```

---

## Chunk 2: RSS 采集脚本

**Files:**
- Create: `scripts/fetch-ai-news.ts`

- [ ] **Step 1: 创建基础脚本结构**

```typescript
// scripts/fetch-ai-news.ts
import Parser from 'rss-parser';

const RSS_SOURCES = [
  { name: 'HackerNews AI', url: 'https://news.ycombinator.com/rss' },
  { name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/news/rss' },
  { name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'arXiv cs.AI', url: 'http://arxiv.org/rss/cs.AI' },
  { name: 'arXiv cs.CL', url: 'http://arxiv.org/rss/cs.CL' },
];

const parser = new Parser();

interface NewsItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  source: string;
}

async function fetchAllFeeds(): Promise<NewsItem[]> {
  const items: NewsItem[] = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items.slice(0, 10)) {
        items.push({
          title: item.title || '',
          link: item.link || '',
          content: item.contentSnippet || item.content || '',
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: source.name,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${source.name}:`, err);
    }
  }

  return items;
}

async function main() {
  const news = await fetchAllFeeds();
  console.log(`Fetched ${news.length} items`);
  console.log(news.slice(0, 3));
}

main().catch(console.error);
```

- [ ] **Step 2: 本地测试采集脚本**

```bash
npx tsx scripts/fetch-ai-news.ts
```

Expected: 输出采集到的新闻数量和前几条标题

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-ai-news.ts
git commit -m "feat: add RSS news fetcher script"
```

---

## Chunk 3: MiniMax API 集成

**Files:**
- Modify: `scripts/fetch-ai-news.ts`

- [ ] **Step 1: 添加 MiniMax API 调用函数**

```typescript
// 在 fetch-ai-news.ts 中添加

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID;

interface RewriteResult {
  title: string;
  content: string;
  summary: string;
}

async function rewriteWithAI(news: NewsItem): Promise<RewriteResult | null> {
  const prompt = `你是一个专业的科技资讯编辑。请将以下英文AI新闻用中文重写，要求：
1. 语言：简体中文
2. 风格：信达雅，用词准确
3. 长度：500字以上
4. 结构：先写一个吸引人的标题，然后是详细正文，最后是原文链接

原文标题：${news.title}
发布时间：${news.pubDate}
来源：${news.source}

原文内容：
${news.content.slice(0, 2000)}

请直接输出重写后的内容，格式如下：
标题：<重写后的标题>
正文：<重写后的正文>
摘要：<100字以内的简介>`;

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [{ role: 'user', content: prompt }],
        group_id: MINIMAX_GROUP_ID,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('MiniMax API returned empty content');
      return null;
    }

    // 解析返回内容
    const titleMatch = content.match(/标题：(.+)/);
    const summaryMatch = content.match(/摘要：(.+)/);
    const bodyMatch = content.match(/正文：([\s\S]+)/);

    return {
      title: titleMatch?.[1]?.trim() || news.title,
      content: bodyMatch?.[1]?.trim() || content,
      summary: summaryMatch?.[1]?.trim() || content.slice(0, 100),
    };
  } catch (err) {
    console.error('MiniMax API error:', err);
    return null;
  }
}
```

- [ ] **Step 2: 更新 main 函数集成 AI 重写**

```typescript
async function main() {
  const news = await fetchAllFeeds();
  console.log(`Fetched ${news.length} items`);

  // 只处理前3条测试
  const toProcess = news.slice(0, 3);

  for (const item of toProcess) {
    console.log(`Processing: ${item.title}`);
    const rewritten = await rewriteWithAI(item);
    if (rewritten) {
      console.log(`  Title: ${rewritten.title}`);
      console.log(`  Summary: ${rewritten.summary}`);
      console.log(`  Length: ${rewritten.content.length} chars`);
    }
    // 防止 API 限流
    await new Promise(r => setTimeout(r, 1000));
  }
}
```

- [ ] **Step 3: 本地测试（确认 MiniMax API key 有效后）**

```bash
export MINIMAX_API_KEY="your-key"
export MINIMAX_GROUP_ID="your-group"
npx tsx scripts/fetch-ai-news.ts
```

Expected: 输出 AI 重写后的标题和摘要

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-ai-news.ts
git commit -m "feat: integrate MiniMax API for AI rewriting"
```

---

## Chunk 4: 数据库发布集成

**Files:**
- Modify: `scripts/fetch-ai-news.ts`
- Create: `scripts/db.ts` (复用现有 prisma client)

- [ ] **Step 1: 创建数据库客户端**

```typescript
// scripts/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

- [ ] **Step 2: 添加文章发布函数**

```typescript
// 在 fetch-ai-news.ts 中添加
import prisma from './db';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) + '-' + Date.now().toString(36);
}

async function publishArticle(rewritten: RewriteResult, source: string): Promise<void> {
  try {
    const article = await prisma.article.create({
      data: {
        title: rewritten.title,
        slug: generateSlug(rewritten.title),
        content: rewritten.content,
        summary: rewritten.summary,
        category: 'ai',
        tags: ['AI', '资讯', '每日推荐'],
        source: source,
        featured: false,
        published: true,
      },
    });
    console.log(`Published article: ${article.id}`);
  } catch (err) {
    console.error('Failed to publish article:', err);
  }
}
```

- [ ] **Step 3: 更新 main 函数**

```typescript
async function main() {
  const news = await fetchAllFeeds();
  console.log(`Fetched ${news.length} items`);

  const toProcess = news.slice(0, 3);

  for (const item of toProcess) {
    console.log(`Processing: ${item.title}`);
    const rewritten = await rewriteWithAI(item);
    if (rewritten) {
      await publishArticle(rewritten, item.link);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
```

- [ ] **Step 4: 本地测试**

```bash
export MINIMAX_API_KEY="your-key"
export MINIMAX_GROUP_ID="your-group"
export DATABASE_URL="postgresql://..."
npx tsx scripts/fetch-ai-news.ts
```

Expected: 数据库中创建新的 Article 记录

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-ai-news.ts scripts/db.ts
git commit -m "feat: add database publishing for AI rewritten news"
```

---

## Chunk 5: GitHub Actions 配置

**Files:**
- Create: `.github/workflows/daily-news.yml`

- [ ] **Step 1: 创建 GitHub Actions 工作流**

```yaml
name: Daily AI News

on:
  schedule:
    # 每天早上 9:00 北京时间 (UTC+8 = 1:00 UTC)
    - cron: '0 1 * * *'
  workflow_dispatch:  # 支持手动触发

jobs:
  fetch-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Fetch and rewrite news
        run: npx tsx scripts/fetch-ai-news.ts
        env:
          MINIMAX_API_KEY: ${{ secrets.MINIMAX_API_KEY }}
          MINIMAX_GROUP_ID: ${{ secrets.MINIMAX_GROUP_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Verify articles created
        run: echo "Daily news fetch completed"
```

- [ ] **Step 2: 添加 GitHub Secrets 说明**

在 `.env.example` 或 README.md 添加:
```bash
# GitHub Actions Secrets 需要设置:
# MINIMAX_API_KEY - MiniMax API 密钥
# MINIMAX_GROUP_ID - MiniMax Group ID
# DATABASE_URL - PostgreSQL 连接字符串
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/daily-news.yml
git commit -m "feat: add GitHub Actions daily news workflow"
```

---

## Chunk 6: 完善过滤逻辑

**Files:**
- Modify: `scripts/fetch-ai-news.ts`

- [ ] **Step 1: 添加关键词过滤**

```typescript
// 在 fetch-ai-news.ts 中添加

const PRODUCT_KEYWORDS = [
  'release', 'launch', 'announce', 'introducing', 'new model',
  'gpt', 'claude', 'gemini', 'llama', 'mistral', '扩散',
  '发布', '推出', '新品', '新功能', '版本'
];

const PAPER_KEYWORDS = [
  'paper', 'research', 'arxiv', 'study', 'benchmark',
  '论文', '研究', '证明', '实验'
];

function isRelevant(item: NewsItem): boolean {
  const text = `${item.title} ${item.content}`.toLowerCase();

  const hasProductKeyword = PRODUCT_KEYWORDS.some(k => text.includes(k.toLowerCase()));
  const hasPaperKeyword = PAPER_KEYWORDS.some(k => text.includes(k.toLowerCase()));

  return hasProductKeyword || hasPaperKeyword;
}

// 在 fetchAllFeeds 后添加过滤
const relevantNews = news.filter(isRelevant);
console.log(`Filtered to ${relevantNews.length} relevant items`);
```

- [ ] **Step 2: Commit**

```bash
git add scripts/fetch-ai-news.ts
git commit -m "feat: add keyword filtering for relevant AI news"
```

---

## 验证清单

- [ ] 本地运行 `npx tsx scripts/fetch-ai-news.ts` 成功
- [ ] 检查生成的文章质量（信达雅）
- [ ] 检查数据库 Article 表记录正确
- [ ] GitHub Actions 配置正确
- [ ] 在 GitHub repo 设置 Secrets
- [ ] 手动触发 GitHub Actions 测试
- [ ] 确认网站正常展示新文章
