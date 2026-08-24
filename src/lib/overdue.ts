import prisma from "@/lib/prisma";
import { DEFAULT_CONFIG } from "@/lib/constants";
import { ComplaintData, ComplaintStatusType } from "@/types";

export async function getOverdueThresholdDays(): Promise<number> {
  try {
    const config = await prisma.systemConfiguration.findUnique({
      where: { key: "OVERDUE_THRESHOLD_DAYS" },
    });

    if (config && config.value) {
      const parsed = parseInt(config.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error fetching OVERDUE_THRESHOLD_DAYS config:", error);
  }

  return DEFAULT_CONFIG.OVERDUE_THRESHOLD_DAYS;
}

/**
 * Derives whether a complaint is overdue dynamically based on its created date,
 * resolved status, and the configured threshold.
 * 
 * Rules:
 * 1. Resolved complaints are NEVER overdue.
 * 2. Unresolved complaints (OPEN or IN_PROGRESS) are overdue if age in days exceeds threshold.
 */
export function isComplaintOverdue(
  createdAt: string | Date,
  status: ComplaintStatusType,
  thresholdDays: number
): boolean {
  if (status === "RESOLVED") {
    return false;
  }

  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= thresholdDays;
}

export function computeComplaintAgeDays(createdAt: string | Date): number {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Annotates complaint data with dynamic overdue flags and age calculations
 */
export function enrichComplaintWithOverdue<T extends { createdAt: string | Date; status: string }>(
  complaint: T,
  thresholdDays: number
): T & { isOverdue: boolean; ageInDays: number } {
  const status = complaint.status as ComplaintStatusType;
  const isOverdue = isComplaintOverdue(complaint.createdAt, status, thresholdDays);
  const ageInDays = computeComplaintAgeDays(complaint.createdAt);

  return {
    ...complaint,
    isOverdue,
    ageInDays,
  };
}
