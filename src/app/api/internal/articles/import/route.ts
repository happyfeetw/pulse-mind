import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseArticleDocument, toArticleData } from "@/lib/articleImport";

export const runtime = "nodejs";

interface ImportRequestBody {
  articles?: Array<{
    filePath?: string;
    raw?: string;
  }>;
}

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.ARTICLE_IMPORT_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(expectedSecret && authorization === `Bearer ${expectedSecret}`);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ImportRequestBody | null;
  const documents = body?.articles;

  if (!Array.isArray(documents)) {
    return NextResponse.json({ error: "articles must be an array" }, { status: 400 });
  }

  const imported: string[] = [];

  for (const document of documents) {
    if (!document.filePath || !document.raw) {
      return NextResponse.json(
        { error: "Each article requires filePath and raw" },
        { status: 400 }
      );
    }

    const article = parseArticleDocument(document.filePath, document.raw);
    const data = toArticleData(article);

    await prisma.article.upsert({
      where: { slug: article.slug },
      create: {
        ...data,
        ...(article.createdAt ? { createdAt: article.createdAt } : {}),
      },
      update: data,
    });

    imported.push(article.slug);
  }

  return NextResponse.json({ imported });
}
