# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 app using the App Router, TypeScript, Prisma, NextAuth, and Tailwind CSS. Application code lives under `src/`: route pages and API handlers are in `src/app`, shared UI is in `src/components`, server utilities are in `src/lib`, and auth setup is in `src/auth.ts` plus `src/app/api/auth/[...nextauth]/route.ts`. Database models are defined in `prisma/schema.prisma`. Static assets belong in `public/`. Product and design notes are kept in `SPEC.md`, `DESIGN.md`, and `docs/superpowers/`. AI article drafts that should be imported into the database live in `content/articles/` as Markdown files with YAML frontmatter.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js dev server, normally at `http://localhost:3000`.
- `npm run build`: create a production build and catch type/build-time issues.
- `npm run start`: serve the production build after `npm run build`.
- `npm run lint`: run ESLint with Next core-web-vitals and TypeScript rules.
- `npm run articles:check`: validate Markdown articles in `content/articles/` without touching the database.
- `npm run articles:import`: upsert Markdown articles into the configured Prisma database.
- `npm run news:codex-issue`: build the daily GitHub issue body used to ask Codex Cloud for an article PR.
- `npx prisma generate`: refresh Prisma Client after schema changes.
- `npx prisma migrate dev --name <change>`: create and apply a local database migration.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and the `@/*` path alias for imports from `src`. Follow the existing two-space indentation and double-quote style. React components use PascalCase filenames, for example `Header.tsx`; utility modules use camelCase exports under `src/lib`. App Router files should keep Next conventions such as `page.tsx`, `layout.tsx`, `route.ts`, and dynamic folders like `[id]`.

## Testing Guidelines

No dedicated test runner is configured yet. For current changes, run `npm run lint` and `npm run build` before handing off. When adding tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the feature, and add an npm script for the chosen runner in the same change. For content-only changes, also run `npm run articles:check`.

## Content Publishing

Markdown articles in `content/articles/` must include `title`, `slug`, `summary`, `category`, `tags`, and `published` frontmatter. Use `category: "ai"` for daily AI news and keep `source` set to the primary original URL. Codex-generated article PRs should only edit `content/articles/**/*.md` unless the task explicitly asks for automation or app changes.

## Commit & Pull Request Guidelines

Recent history uses concise Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, and `chore:`. Keep commits scoped to one logical change. Pull requests should include a short description, validation commands run, linked issue or context, and screenshots for visible UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local setup and never commit secrets. Required values include `DATABASE_URL`, `AUTH_SECRET`, GitHub OAuth credentials, and `ADMIN_GITHUB_IDS`. Review auth and admin paths carefully when changing role or session behavior.

## Agent-Specific Instructions

This project uses a newer Next.js version with breaking API and file-structure changes. Before writing framework-sensitive code, read the relevant guide in `node_modules/next/dist/docs/` and follow deprecation notices.
