import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getOverdueThresholdDays, enrichComplaintWithOverdue } from "@/lib/overdue";
import { ComplaintStatusType } from "@/types";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const thresholdDays = await getOverdueThresholdDays();

    // Query filter based on role
    const where: any = {};
    if (session.role === "RESIDENT") {
      where.residentId = session.id;
    }

    // Fetch all complaints for calculation
    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            email: true,
            unitNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedComplaints = complaints.map((c) =>
      enrichComplaintWithOverdue(c, thresholdDays)
    );

    const totalComplaints = enrichedComplaints.length;
    const openComplaints = enrichedComplaints.filter((c) => c.status === "OPEN").length;
    const inProgressComplaints = enrichedComplaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolvedComplaints = enrichedComplaints.filter((c) => c.status === "RESOLVED").length;
    const overdueComplaints = enrichedComplaints.filter((c) => c.isOverdue).length;
    const highPriorityComplaints = enrichedComplaints.filter((c) => c.priority === "HIGH").length;

    // Status breakdown
    const statuses: ComplaintStatusType[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    const statusBreakdown = statuses.map((st) => {
      const count = enrichedComplaints.filter((c) => c.status === st).length;
      return {
        status: st,
        count,
        percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0,
      };
    });

    // Category breakdown
    const categoryMap = new Map<string, number>();
    for (const c of enrichedComplaints) {
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Fetch pinned notices
    const pinnedNotices = await prisma.notice.findMany({
      where: { isPinned: true },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalComplaints,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        overdueComplaints,
        highPriorityComplaints,
        recentComplaints: enrichedComplaints.slice(0, 5),
        statusBreakdown,
        categoryBreakdown,
        pinnedNotices,
        overdueThresholdDays: thresholdDays,
      },
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate dashboard statistics." },
      { status: 500 }
    );
  }
}
