import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getOverdueThresholdDays, enrichComplaintWithOverdue } from "@/lib/overdue";
import { sendComplaintStatusChangeNotification } from "@/lib/email";
import { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "@/lib/constants";

const updateComplaintSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES).optional(),
  priority: z.enum(COMPLAINT_PRIORITIES).optional(),
  note: z.string().max(500).optional().nullable(),
});

// Allowed status transitions mapping
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED: ["IN_PROGRESS", "OPEN"], // Allow reopening with explicit admin note if needed
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const complaintId = params.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
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
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    // STRICT AUTHORIZATION: Residents can ONLY view their own complaints
    if (session.role === "RESIDENT" && complaint.residentId !== session.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. You do not have permission to view this complaint.",
        },
        { status: 403 }
      );
    }

    const thresholdDays = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(complaint, thresholdDays);

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error("Error fetching complaint details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaint details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only ADMIN can modify complaint status and priority
  const authResult = await requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;
  const { session } = authResult;

  try {
    const complaintId = params.id;
    const body = await req.json();
    const validated = updateComplaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid update payload",
        },
        { status: 400 }
      );
    }

    const { status: newStatus, priority: newPriority, note } = validated.data;

    // Fetch existing complaint
    const existing = await prisma.complaint.findUnique({
      where: { id: complaintId },
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

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    let statusChanged = false;
    let priorityChanged = false;

    // Validate status transition if status is being updated
    if (newStatus && newStatus !== existing.status) {
      const allowedNextStatuses = VALID_TRANSITIONS[existing.status] || [];
      if (!allowedNextStatuses.includes(newStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status transition from "${existing.status}" to "${newStatus}".`,
          },
          { status: 400 }
        );
      }
      statusChanged = true;
    }

    if (newPriority && newPriority !== existing.priority) {
      priorityChanged = true;
    }

    if (!statusChanged && !priorityChanged && !note) {
      return NextResponse.json(
        { success: false, error: "No changes specified." },
        { status: 400 }
      );
    }

    // Execute atomic update and history creation
    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (statusChanged && newStatus) {
        updateData.status = newStatus;
        if (newStatus === "RESOLVED") {
          updateData.resolvedAt = new Date();
        } else if (existing.status === "RESOLVED") {
          updateData.resolvedAt = null; // Cleared if reopened
        }
      }

      if (priorityChanged && newPriority) {
        updateData.priority = newPriority;
      }

      const complaintResult = await tx.complaint.update({
        where: { id: complaintId },
        data: updateData,
        include: {
          resident: {
            select: {
              id: true,
              name: true,
              email: true,
              unitNumber: true,
            },
          },
          history: {
            include: {
              actor: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { timestamp: "desc" },
          },
        },
      });

      // Record immutable history log entry
      if (statusChanged && newStatus) {
        await tx.complaintHistory.create({
          data: {
            complaintId: complaintId,
            previousStatus: existing.status,
            newStatus: newStatus,
            actorId: session.id,
            note: note?.trim() || `Status updated from ${existing.status} to ${newStatus} by Administrator`,
          },
        });
      } else if (priorityChanged && newPriority) {
        await tx.complaintHistory.create({
          data: {
            complaintId: complaintId,
            previousStatus: existing.status,
            newStatus: existing.status,
            actorId: session.id,
            note: note?.trim()
              ? `Priority changed to ${newPriority}: ${note.trim()}`
              : `Priority updated to ${newPriority} by Administrator`,
          },
        });
      } else if (note) {
        await tx.complaintHistory.create({
          data: {
            complaintId: complaintId,
            previousStatus: existing.status,
            newStatus: existing.status,
            actorId: session.id,
            note: note.trim(),
          },
        });
      }

      return complaintResult;
    });

    // Re-fetch complete fresh history
    const freshComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        resident: {
          select: { id: true, name: true, email: true, unitNumber: true, phone: true },
        },
        history: {
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    const thresholdDays = await getOverdueThresholdDays();
    const enriched = enrichComplaintWithOverdue(freshComplaint!, thresholdDays);

    // Trigger asynchronous email notification if status changed
    if (statusChanged && newStatus && existing.resident?.email) {
      sendComplaintStatusChangeNotification({
        to: existing.resident.email,
        residentName: existing.resident.name,
        complaintId: existing.id,
        complaintTitle: existing.title,
        category: existing.category,
        previousStatus: existing.status,
        newStatus: newStatus,
        actorName: session.name,
        note: note || undefined,
      }).catch((err) => console.error("Background email dispatch failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Complaint updated successfully",
      data: enriched,
    });
  } catch (error: any) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint." },
      { status: 500 }
    );
  }
}
