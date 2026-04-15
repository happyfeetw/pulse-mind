import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/articles/slug/[slug] - Get article by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
