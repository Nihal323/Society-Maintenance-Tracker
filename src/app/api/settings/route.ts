import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { DEFAULT_CONFIG } from "@/lib/constants";

const settingsSchema = z.object({
  OVERDUE_THRESHOLD_DAYS: z.number().int().min(1).max(30).optional(),
  SOCIETY_NAME: z.string().min(2).max(100).optional(),
  DEFAULT_PRIORITY: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  SOCIETY_ADDRESS: z.string().optional(),
  CONTACT_PHONE: z.string().optional(),
  CONTACT_EMAIL: z.string().email().optional(),
});

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const configs = await prisma.systemConfiguration.findMany();
    const configMap: Record<string, any> = { ...DEFAULT_CONFIG };

    for (const c of configs) {
      if (c.key === "OVERDUE_THRESHOLD_DAYS") {
        configMap[c.key] = parseInt(c.value, 10) || DEFAULT_CONFIG.OVERDUE_THRESHOLD_DAYS;
      } else {
        configMap[c.key] = c.value;
      }
    }

    return NextResponse.json({
      success: true,
      data: configMap,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const body = await req.json();
    const validated = settingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || "Invalid settings payload" },
        { status: 400 }
      );
    }

    const updates = validated.data;

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        await prisma.systemConfiguration.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "System configuration updated successfully",
      data: updates,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update system settings" },
      { status: 500 }
    );
  }
}
