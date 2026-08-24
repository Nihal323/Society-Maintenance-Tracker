import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const updateNoticeSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  content: z.string().min(10).optional(),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!notice) {
      return NextResponse.json(
        { success: false, error: "Notice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const body = await req.json();
    const validated = updateNoticeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await prisma.notice.update({
      where: { id: params.id },
      data: {
        ...validated.data,
        updatedAt: new Date(),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notice updated successfully",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update notice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    await prisma.notice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}
