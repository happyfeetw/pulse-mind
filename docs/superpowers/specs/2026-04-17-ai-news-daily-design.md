# AI 资讯自动采集与重写系统设计

**日期**: 2026-04-17
**状态**: 已批准

---

## 目标

每天北京时间 00:00、08:00、16:00 自动从官方博客、主流科技媒体、工程社区、中文资讯入口、论文源和高质量技术博客中采集过去 8 小时内的 AI 候选信息，由 Codex Cloud 生成中文 AI 精选简报 PR。目标不是复述单条新闻，而是帮助读者快速理解最新、最有质量、最有用的 AI 动态。

---

## 采集范围

| 类型 | 来源示例 |
|------|---------|
| 官方发布 | OpenAI、Google DeepMind、Hugging Face 等官方博客/RSS |
| 工程与创业社区 | Hacker News |
| 主流科技媒体 | The Verge AI、TechCrunch AI |
| 中文 AI 资讯 | 量子位 |
| 技术论文 | arXiv cs.AI、cs.CL |
| 高质量技术博客 | BestBlogs.dev |

**降级策略**：无产品/论文时，收集 Reddit r/MachineLearning、HN AI 频道等社区动态。

---

## 技术架构

```
GitHub Actions (每天 00:00 / 08:00 / 16:00 UTC+8)
     ↓
scripts/prepare-codex-news-issue.ts
     ↓
采集层: RSS 解析
     ↓
过滤层: 过去 8 小时时间窗 + AI 关键词过滤
     ↓
Codex Cloud: 基于 issue 候选源生成 Markdown 文章 PR
     ↓
PR 校验: articles:check + lint + build
     ↓
发布: Prisma migration + Markdown 导入 PostgreSQL Article 表
     ↓
网站展示: 复用现有 / 页面
```

`scripts/fetch-ai-news.ts` 保留为可选 fallback：直接调用 OpenAI Responses API / GPT-5.5 重写并写入数据库。

---

## 采集源 (RSS)

| 来源 | URL |
|------|-----|
| OpenAI News | https://openai.com/news/rss.xml |
| Hacker News AI | https://news.ycombinator.com/rss |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| QbitAI | https://qbitai.com/feed |
| DeepMind | https://deepmind.google/blog/rss.xml |
| Hugging Face | https://huggingface.co/blog/feed.xml |
| BestBlogs.dev | https://www.bestblogs.dev/en/feeds/rss |
| arXiv cs.AI | http://arxiv.org/rss/cs.AI |
| arXiv cs.CL | http://arxiv.org/rss/cs.CL |

---

## AI 重写要求

- **语言**: 简体中文（中文重写，非直译）
- **风格**: 信达雅，用词准确
- **长度**: 1200-1800 中文字符
- **结构**: 开头 + 3-5 个精选条目 + 结尾
- **要求**: 每个条目说明发生了什么、为什么重要、谁该关注、实际启发是什么，并在正文中包含来源链接
- **字段映射**:
  - `title` → 重写后的中文标题
  - `content` → 重写后的正文 (Markdown)
  - `summary` → 100字简介
  - `source` → 原链接
  - `category` → "ai"
  - `tags` → ["AI", "资讯", ...]
  - `published` → true
  - `featured` → false

---

## 数据模型

```prisma
model Article {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  summary   String   @db.Text
  category  String   // "ai" | "backend" | "frontend"
  tags      String[]
  source    String?  // 原链接
  featured  Boolean  @default(false)
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 文件结构

```
scripts/
└── fetch-ai-news.ts    # 主脚本

.github/
└── workflows/
    └── daily-news.yml  # GitHub Actions 工作流
```

---

## 依赖

```json
{
  "rss-parser": "^3.x",
  "openai-responses-api": "via HTTP"
}
```

---

## 环境变量

```bash
OPENAI_API_KEY="your-api-key"
OPENAI_MODEL="gpt-5.5"
OPENAI_REASONING_EFFORT="medium"
DATABASE_URL="postgresql://..."  # 复用现有
```

---

## 错误处理

1. **采集失败**: 重试 3 次，间隔 5 秒
2. **AI API 失败**: 跳过该条，次日再试
3. **数据库写入失败**: 记录日志，发送通知（可选）
4. **无新内容**: 正常结束，不发布空内容

---

## 验证步骤

1. 本地运行脚本，验证采集+重写流程
2. 检查生成的文章质量（信达雅）
3. 验证数据库写入正确
4. 配置 GitHub Actions secret
5. 手动触发 Actions 测试
6. 确认网站正常展示
