import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("errorResponse" in authResult) return authResult.errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in request." },
        { status: 400 }
      );
    }

    const result = await saveUploadedFile(file);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to upload image" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Photo uploaded successfully",
      url: result.url,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error processing upload." },
      { status: 500 }
    );
  }
}
