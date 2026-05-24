import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { markdownToHtml } from "@/lib/markdown";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/articles/slug/[slug] - Get article by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article || (!isAdmin && !article.published)) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const contentHtml = await markdownToHtml(article.content);

    return NextResponse.json({
      ...article,
      contentHtml,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
