# AI 资讯自动采集与重写系统设计

**日期**: 2026-04-17
**状态**: 已批准

---

## 目标

每天早上 9 点自动从各大 AI 公司官方渠道采集资讯，由 AI 用中文（信达雅）重写后发布到网站。

---

## 采集范围

| 类型 | 来源示例 |
|------|---------|
| 产品发布 | OpenAI、Google DeepMind、Anthropic、Meta AI 等官方博客/RSS |
| 技术论文 | arXiv cs.AI、cs.CL、Hugging Face 论文更新 |

**降级策略**：无产品/论文时，收集 Reddit r/MachineLearning、HN AI 频道等社区动态。

---

## 技术架构

```
GitHub Actions (每天 9:00 UTC+8)
     ↓
scripts/fetch-ai-news.ts
     ↓
采集层: RSS 解析 + 官方 API
     ↓
过滤层: 关键词过滤产品发布/论文
     ↓
AI 重写: MiniMax API (中文重写 500+字)
     ↓
发布: 写入 PostgreSQL Article 表
     ↓
网站展示: 复用现有 / 页面
```

---

## 采集源 (RSS)

| 来源 | URL |
|------|-----|
| OpenAI Blog | https://news.ycombinator.com/rss |
| DeepMind | https://deepmind.google/blog/rss.xml |
| Anthropic | https://www.anthropic.com/news/rss |
| Meta AI | https://ai.meta.com/blog/rss/ |
| Hugging Face | https://huggingface.co/blog/feed.xml |
| arXiv cs.AI | http://arxiv.org/rss/cs.AI |
| arXiv cs.CL | http://arxiv.org/rss/cs.CL |

---

## AI 重写要求

- **语言**: 简体中文（中文重写，非直译）
- **风格**: 信达雅，用词准确
- **长度**: 500 字以上
- **结构**: 标题 + 正文 + 来源链接
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
  "minimax-api": "via HTTP"
}
```

---

## 环境变量

```bash
MINIMAX_API_KEY="your-api-key"
MINIMAX_GROUP_ID="your-group-id"
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
