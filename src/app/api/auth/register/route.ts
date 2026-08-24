import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { UserRole, UserSession } from "@/types";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  unitNumber: z.string().min(1, "Flat/Unit number is required"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { name, email, password, unitNumber, phone } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    // Hash password & create resident
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "RESIDENT", // Enforce resident role on public registration
        unitNumber: unitNumber.trim(),
        phone: phone?.trim() || null,
      },
    });

    // Create session and set cookie
    const session: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };

    await setSessionCookie(session);

    return NextResponse.json({
      success: true,
      message: "Registration successful! Welcome to the society portal.",
      data: session,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
