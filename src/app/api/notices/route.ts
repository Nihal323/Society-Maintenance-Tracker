import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sendImportantNoticeNotification } from "@/lib/email";

const noticeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().default("General"),
  isPinned: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const notices = await prisma.notice.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      // Order pinned notices first, then newest
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: notices,
    });
  } catch (error: any) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notices." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Only ADMIN can post notices
  const authResult = await requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const body = await req.json();
    const validated = noticeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid notice payload",
        },
        { status: 400 }
      );
    }

    const { title, content, category, isPinned } = validated.data;

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        isPinned,
        authorId: session.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If marked important/pinned, broadcast email to residents
    if (isPinned) {
      const residents = await prisma.user.findMany({
        where: { role: "RESIDENT" },
        select: { email: true },
      });

      const recipientEmails = residents.map((r) => r.email).filter(Boolean);
      if (recipientEmails.length > 0) {
        sendImportantNoticeNotification({
          to: recipientEmails,
          noticeId: notice.id,
          title: notice.title,
          content: notice.content,
          category: notice.category,
          authorName: session.name,
        }).catch((err) => console.error("Notice email broadcast error:", err));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notice published successfully",
      data: notice,
    });
  } catch (error: any) {
    console.error("Error creating notice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish notice." },
      { status: 500 }
    );
  }
}
