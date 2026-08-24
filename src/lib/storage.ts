import fs from "fs";
import path from "path";

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Max file size: 5 MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Validates and saves an uploaded file to the public/uploads directory.
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  try {
    // 1. Validate file existence
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // 2. Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: `Invalid file type "${file.type}". Only JPG, PNG, WEBP, and GIF images are allowed.`,
      };
    }

    // 3. Validate size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed limit of 5MB.`,
      };
    }

    // 4. Ensure target uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 5. Generate secure, unique filename with extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(extension)
      ? extension
      : "jpg";
    const uniqueId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const fileName = `complaint_${uniqueId}.${sanitizedExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // 6. Write file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 7. Return public URL
    const publicUrl = `/uploads/${fileName}`;
    return {
      success: true,
      url: publicUrl,
      filename: fileName,
    };
  } catch (error: any) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to process and save file upload",
    };
  }
}
