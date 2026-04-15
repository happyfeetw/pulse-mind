import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/comments - Get comments for an article
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { articleId, content } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: "articleId and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId,
        userId: session.user.id as string,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
