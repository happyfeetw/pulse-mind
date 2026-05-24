import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArticleDocument } from "../src/lib/articleImport";

const articlesDir = path.join(process.cwd(), "content", "articles");
const endpoint =
  process.env.ARTICLE_IMPORT_URL ||
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/internal/articles/import`
    : "");
const secret = process.env.ARTICLE_IMPORT_SECRET;

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

async function main() {
  const files = await listMarkdownFiles(articlesDir);

  if (files.length === 0) {
    console.log("No Markdown articles found.");
    return;
  }

  if (!endpoint) {
    throw new Error("ARTICLE_IMPORT_URL or NEXT_PUBLIC_APP_URL is required");
  }

  if (!secret) {
    throw new Error("ARTICLE_IMPORT_SECRET is required");
  }

  const articles = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf8");
      const relativePath = path.relative(process.cwd(), filePath);
      parseArticleDocument(relativePath, raw);
      return { filePath: relativePath, raw };
    }),
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ articles }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Article import failed: ${response.status} ${text}`);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
