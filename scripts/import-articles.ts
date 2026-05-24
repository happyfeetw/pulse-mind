import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArticleDocument, toArticleData } from "../src/lib/articleImport";

const articlesDir = path.join(process.cwd(), "content", "articles");
const dryRun = process.argv.includes("--dry-run");

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

async function parseArticle(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return parseArticleDocument(path.relative(process.cwd(), filePath), raw);
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
      const data = toArticleData(article);

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
