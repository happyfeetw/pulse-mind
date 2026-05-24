import matter from "gray-matter";
import { categories, slugify } from "@/lib/utils";

export interface ArticleDocument {
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

const validCategories = new Set<string>(categories.map((category) => category.value));

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

export function parseArticleDocument(filePath: string, raw: string): ArticleDocument {
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
    throw new Error(`${filePath}: ${errors.join("; ")}`);
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

export function toArticleData(article: ArticleDocument) {
  return {
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
}
