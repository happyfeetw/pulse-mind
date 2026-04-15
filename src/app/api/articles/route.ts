import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET /api/articles - List articles with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (published !== null && published !== undefined) {
      where.published = published === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          category: true,
          tags: true,
          source: true,
          featured: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, summary, category, tags, source, featured, published } = body;

    if (!title || !content || !summary || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = slugify(title);

    // Check if slug already exists and make it unique if needed
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        summary,
        category,
        tags: tags || [],
        source: source || "原创",
        featured: featured || false,
        published: published || false,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
