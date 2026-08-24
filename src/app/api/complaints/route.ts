import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getOverdueThresholdDays, enrichComplaintWithOverdue } from "@/lib/overdue";
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from "@/lib/constants";

const createComplaintSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  category: z.string().refine((val) => COMPLAINT_CATEGORIES.includes(val as any), {
    message: "Invalid complaint category selected",
  }),
  photoUrl: z.string().optional().nullable(),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
});

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const overdueOnly = searchParams.get("overdue") === "true";
    const search = searchParams.get("search");
    const residentId = searchParams.get("residentId");

    const thresholdDays = await getOverdueThresholdDays();

    // Base query conditions
    const where: any = {};

    // Authorization: Residents can ONLY see their own complaints
    if (session.role === "RESIDENT") {
      where.residentId = session.id;
    } else if (residentId && session.role === "ADMIN") {
      where.residentId = residentId;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { resident: { name: { contains: search } } },
        { resident: { unitNumber: { contains: search } } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        resident: {
          select: {
            id: true,
            name: true,
            email: true,
            unitNumber: true,
            phone: true,
          },
        },
        history: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with dynamic overdue calculations
    let enriched = complaints.map((c) => enrichComplaintWithOverdue(c, thresholdDays));

    // Filter by overdue if requested
    if (overdueOnly) {
      enriched = enriched.filter((c) => c.isOverdue);
    }

    return NextResponse.json({
      success: true,
      data: enriched,
      meta: {
        total: enriched.length,
        thresholdDays,
      },
    });
  } catch (error: any) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["RESIDENT", "ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const body = await req.json();
    const validated = createComplaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { title, description, category, photoUrl, priority } = validated.data;

    // Fetch default priority from config if not supplied
    let complaintPriority = priority || "MEDIUM";
    if (!priority) {
      const config = await prisma.systemConfiguration.findUnique({
        where: { key: "DEFAULT_PRIORITY" },
      });
      if (config?.value && ["LOW", "MEDIUM", "HIGH"].includes(config.value)) {
        complaintPriority = config.value as any;
      }
    }

    // Create complaint in transaction with initial history entry
    const complaint = await prisma.$transaction(async (tx) => {
      const newComplaint = await tx.complaint.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          category,
          photoUrl: photoUrl || null,
          priority: complaintPriority,
          status: "OPEN",
          residentId: session.id,
        },
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
      });

      // Record initial history
      await tx.complaintHistory.create({
        data: {
          complaintId: newComplaint.id,
          previousStatus: null,
          newStatus: "OPEN",
          actorId: session.id,
          note: `Complaint filed by resident ${session.name} (${session.unitNumber || "N/A"}).`,
        },
      });

      return newComplaint;
    });

    const thresholdDays = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(complaint, thresholdDays);

    return NextResponse.json({
      success: true,
      message: "Complaint submitted successfully!",
      data: enriched,
    });
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit complaint." },
      { status: 500 }
    );
  }
}
