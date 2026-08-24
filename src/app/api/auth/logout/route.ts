import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to log out" },
      { status: 500 }
    );
  }
}
