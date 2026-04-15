import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/articles/[id] - Get single article
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
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

// PUT /api/articles/[id] - Update article
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, summary, category, tags, source, featured, published } = body;

    // Check if article exists
    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = slugify(title);
      const conflict = await prisma.article.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      if (conflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug,
        content: content ?? existing.content,
        summary: summary ?? existing.summary,
        category: category ?? existing.category,
        tags: tags ?? existing.tags,
        source: source ?? existing.source,
        featured: featured ?? existing.featured,
        published: published ?? existing.published,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
