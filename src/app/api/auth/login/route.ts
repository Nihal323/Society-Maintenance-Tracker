import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { UserRole, UserSession } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.errors[0]?.message || "Invalid email or password format",
        },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

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
      message: "Logged in successfully",
      data: session,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
