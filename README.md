# PulseMind

PulseMind is a personal AI news and technical writing site built with Next.js 16, Prisma, NextAuth, and PostgreSQL.

## What Is Implemented

- Public pages for the home feed, docs list, article detail, about page, and settings.
- GitHub OAuth sign-in with NextAuth.
- Admin-only article management under `/admin`.
- Article and comment APIs backed by Prisma.
- Markdown article import from `content/articles/`.
- Daily AI news request automation through GitHub Actions and Codex Cloud.

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

The app normally runs at `http://localhost:3000`.

Required local environment values:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ADMIN_GITHUB_IDS`

## Useful Commands

```bash
npm run lint
npm run build
npm run articles:check
npm run articles:import
npm run news:codex-issue
npm run news:fetch -- --dry-run
```

Use `npm run articles:check` for content-only changes. Use `npm run news:codex-issue` to preview the GitHub issue body that asks Codex Cloud to create the daily AI article PR.

## Content Workflow

Daily AI articles are generated as Markdown files under `content/articles/`.

The preferred production flow is:

1. `Daily Codex News Request` creates or updates a daily GitHub issue with RSS candidates.
2. Codex Cloud creates a PR containing exactly one Markdown file under `content/articles/`.
3. `Codex News PR` validates the Markdown, lint, and build.
4. After merge to `main`, `Publish Articles` SSHes into the production server, pulls `main`, applies Prisma migrations, imports Markdown into PostgreSQL, rebuilds, and restarts PM2.

The direct OpenAI ingestion script `npm run news:fetch` is retained as an optional fallback and requires `OPENAI_API_KEY`.

## Markdown Article Format

```markdown
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
createdAt: "2026-05-24T09:00:00.000+08:00"
---

正文使用 Markdown。
```

Required frontmatter fields are `title`, `slug`, `summary`, `category`, `tags`, and `published`.

## Deployment Notes

For a server deployment, build and restart the Next.js process after syncing source changes:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

Never commit real credentials. Keep production secrets in the deployment platform or GitHub Actions secrets. The self-hosted publish workflow needs `PULSE_MIND_DEPLOY_HOST`, `PULSE_MIND_DEPLOY_USER`, and `PULSE_MIND_DEPLOY_KEY`.
