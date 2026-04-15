import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete comments" },
        { status: 401 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const userRole = (session.user as { role?: string })?.role;
    const userId = session.user.id as string;

    // Only admin or the comment owner can delete
    if (userRole !== "admin" && comment.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
