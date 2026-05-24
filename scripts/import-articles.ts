import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { categories, slugify } from "../src/lib/utils";

interface ArticleDocument {
  filePath: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  source: string | null;
  featured: boolean;
  published: boolean;
  createdAt: Date | null;
  content: string;
}

const articlesDir = path.join(process.cwd(), "content", "articles");
const dryRun = process.argv.includes("--dry-run");
const validCategories = new Set<string>(categories.map((category) => category.value));

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat().sort();
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function getTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function getDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

async function parseArticle(filePath: string): Promise<ArticleDocument> {
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);
  const title = getString(parsed.data.title);
  const slug = getString(parsed.data.slug) || slugify(title);
  const summary = getString(parsed.data.summary);
  const category = getString(parsed.data.category) || "ai";
  const tags = getTags(parsed.data.tags);
  const content = parsed.content.trim();

  const errors: string[] = [];

  if (!title) errors.push("title is required");
  if (!slug) errors.push("slug is required or title must be slugifiable");
  if (!summary) errors.push("summary is required");
  if (!validCategories.has(category)) {
    errors.push(`category must be one of: ${Array.from(validCategories).join(", ")}`);
  }
  if (tags.length === 0) errors.push("tags must include at least one value");
  if (!content) errors.push("Markdown content is required");

  if (errors.length > 0) {
    throw new Error(`${path.relative(process.cwd(), filePath)}: ${errors.join("; ")}`);
  }

  return {
    filePath,
    title,
    slug,
    summary,
    category,
    tags,
    source: getString(parsed.data.source) || null,
    featured: getBoolean(parsed.data.featured, false),
    published: getBoolean(parsed.data.published, true),
    createdAt: getDate(parsed.data.createdAt),
    content,
  };
}

async function main() {
  const files = await listMarkdownFiles(articlesDir);

  if (files.length === 0) {
    console.log("No Markdown articles found.");
    return;
  }

  const articles = await Promise.all(files.map(parseArticle));

  if (dryRun) {
    for (const article of articles) {
      console.log(`Valid: ${path.relative(process.cwd(), article.filePath)} (${article.slug})`);
    }
    return;
  }

  const { default: prisma } = await import("../src/lib/prisma");

  try {
    for (const article of articles) {
      const data = {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        category: article.category,
        tags: article.tags,
        source: article.source,
        featured: article.featured,
        published: article.published,
      };

      await prisma.article.upsert({
        where: { slug: article.slug },
        create: {
          ...data,
          ...(article.createdAt ? { createdAt: article.createdAt } : {}),
        },
        update: data,
      });

      console.log(`Imported: ${article.slug}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
