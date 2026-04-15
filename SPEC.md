# PulseMind — 个人 AI 资讯与文档站

> 项目名称：PulseMind（脉冲思维）
> 定位：个人 AI 资讯聚合 + 文档发布平台
> 设计风格参考：Notion 暖色简约 + Mintlify 文档优化

---

## 1. Visual Theme & Atmosphere

**整体氛围**：温暖、专业、阅读友好
**设计哲学**：内容优先，减少视觉噪音，让文字和代码成为主角
**密度**：中等偏低，留白充足，适合长时间阅读
**情绪词**：沉静、有深度、值得信赖

---

## 2. Color Palette

### 主色调
| Token | Hex | 用途 |
|-------|-----|------|
| `--bg-primary` | `#FFFFFF` | 主背景 |
| `--bg-secondary` | `#F7F6F3` | 次级背景、卡片 |
| `--bg-tertiary` | `#EFEDED` | 边框、分割线 |
| `--text-primary` | `#1A1A1A` | 主文字 |
| `--text-secondary` | `#6B6B6B` | 次级文字 |
| `--text-tertiary` | `#9B9B9B` | 占位符、提示 |
| `--accent-primary` | `#E56A4C` | Notion 风格珊瑚橙，强调色 |
| `--accent-secondary` | `#2EAADC` | 链接、交互元素 |
| `--accent-success` | `#4CAF50` | 成功状态 |
| `--accent-warning` | `#F5A623` | 警告状态 |
| `--accent-error` | `#E53935` | 错误状态 |

### 暗色模式
| Token | Hex | 用途 |
|-------|-----|------|
| `--dark-bg-primary` | `#191919` | 主背景 |
| `--dark-bg-secondary` | `#242424` | 次级背景 |
| `--dark-bg-tertiary` | `#2E2E2E` | 边框 |
| `--dark-text-primary` | `#ECECEC` | 主文字 |
| `--dark-text-secondary` | `#9B9B9B` | 次级文字 |

---

## 3. Typography

### 字体
- **标题**：`'Newsreader', Georgia, serif` — 有品位的衬线体，适合长文阅读
- **正文**：`'Inter', -apple-system, sans-serif` — 清晰的无衬线体
- **代码**：`'JetBrains Mono', 'Fira Code', monospace`

### 字号层级
| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| H1 | 48px | 700 | 1.2 |
| H2 | 36px | 600 | 1.25 |
| H3 | 24px | 600 | 1.3 |
| H4 | 18px | 600 | 1.4 |
| Body | 16px | 400 | 1.7 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

---

## 4. Layout Structure

### 整体布局
```
┌─────────────────────────────────────────────┐
│  Header (Logo + Nav + Theme Toggle)         │
├─────────────────────────────────────────────┤
│                                             │
│  Main Content Area                          │
│  - 侧边导航 (可选)                           │
│  - 内容区 (最大宽度 720px，居中)              │
│                                             │
├─────────────────────────────────────────────┤
│  Footer (版权 + 链接)                        │
└─────────────────────────────────────────────┘
```

### 页面结构

#### 首页 / 资讯页 (`/`)
- Hero 区域：大标题 + 一句话介绍
- 今日 AI 资讯列表（按时间倒序）
- 每条资讯卡片：标题 + 来源 + 发布时间 + 摘要

#### 文档页 (`/docs/...`)
- 左侧类目导航
- 右侧文章内容
- 支持 Markdown 渲染
- 代码高亮

#### 关于页 (`/about`)
- 个人介绍
- 联系方式

---

## 5. Component Styling

### 按钮
- **Primary**：`bg: accent-primary`, `color: white`, `border-radius: 6px`
- **Secondary**：`bg: transparent`, `border: 1px solid --bg-tertiary`
- **Hover**：轻微上浮 + 阴影加深
- **Disabled**：`opacity: 0.5`, `cursor: not-allowed`

### 卡片
- `bg: --bg-secondary`
- `border-radius: 8px`
- `padding: 24px`
- `border: 1px solid --bg-tertiary`
- `hover`: 边框变为 accent-primary（浅）

### 导航
- 顶部固定导航栏
- 高度：64px
- 背景：毛玻璃效果 `backdrop-filter: blur(12px)`
- Logo 左侧，导航项居中/右侧

### 标签 (Tag/Badge)
- `padding: 4px 12px`
- `border-radius: 999px`
- `font-size: 12px`
- `bg: --bg-tertiary`

---

## 6. Spacing System

使用 4px 基准网格：
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

---

## 7. 功能模块

### 7.1 每日 AI 资讯（Daily AI News）
- **来源**：每日自动搜索 AI 相关新闻
- **展示**：卡片列表，包含标题、来源、摘要、时间
- **筛选**：支持按来源/日期筛选
- **详情页**：点击跳转原链或展开摘要

### 7.2 个人文档（Publications）
- **格式**：Markdown 文件
- **分类**：按类目组织（技术文章、项目记录、读书笔记等）
- **功能**：
  - Markdown 渲染
  - 代码高亮（支持 50+ 语言）
  - 目录自动生成
  - 搜索

### 7.3 自动新闻采集（News Aggregation）
- **频率**：每日定时执行
- **来源**：
  - 微信公众号（RSS）
  - Twitter/X
  - TechCrunch AI
  - AI 垂直媒体
- **存储**：SQLite 数据库
- **发布**：自动发布到网站

---

## 8. 技术方案

### 前端
- **框架**：Next.js 14+ (App Router)
- **样式**：Tailwind CSS
- **Markdown**：next-mdx-remote 或 MDX
- **代码高亮**：Shiki
- **搜索**：Fuse.js（客户端）

### 后端
- **框架**：Node.js API Routes（Next.js 集成）
- **数据库**：SQLite（通过 better-sqlite3）
- **定时任务**：node-cron

### 新闻采集
- **RSS 解析**：rss-parser
- **Twitter**：官方 API v2
- **存储**：文章元数据 + 原文缓存

### 部署
- **平台**：待定（Vercel / Railway / 手动服务器）
- **域名**：待定

---

## 9. 项目结构

```
pulse-mind/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 全局布局
│   │   ├── page.tsx            # 首页（资讯列表）
│   │   ├── docs/
│   │   │   ├── page.tsx        # 文档列表
│   │   │   └── [...slug]/      # 文档详情
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── news/           # 资讯 API
│   │       └── docs/          # 文档 API
│   ├── components/
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── ui/                # Button, Card, Badge
│   │   └── news/              # NewsCard, NewsList
│   ├── lib/
│   │   ├── db.ts              # 数据库连接
│   │   ├── news.ts            # 新闻采集逻辑
│   │   └── markdown.ts        # Markdown 处理
│   └── styles/
│       └── globals.css
├── content/
│   └── docs/                  # Markdown 文档
├── data/
│   └── pulse-mind.db          # SQLite 数据库
├── scripts/
│   └── fetch-news.ts          # 定时采集脚本
├── public/
├── package.json
├── tailwind.config.ts
├── next.config.js
└── DESIGN.md                   # 设计规范
```

---

## 10. TODO

- [ ] 确定项目名称（PulseMind 是否合适？）
- [ ] 确认技术栈（Next.js + SQLite？）
- [ ] 确定部署平台
- [ ] 设计数据模型（News, Document 表结构）
- [ ] 开始开发

---

*最后更新：2026-04-15*
