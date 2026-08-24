import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const complaintId = params.id;

    // Check complaint ownership
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { residentId: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    if (session.role === "RESIDENT" && complaint.residentId !== session.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const history = await prisma.complaintHistory.findMany({
      where: { complaintId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
