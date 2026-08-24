import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PhotoUploadPreviewProps {
  onUploadSuccess: (url: string) => void;
  onRemove: () => void;
  currentPhotoUrl?: string | null;
}

export function PhotoUploadPreview({
  onUploadSuccess,
  onRemove,
  currentPhotoUrl,
}: PhotoUploadPreviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please select a valid image file (JPG, PNG, WEBP, or GIF).");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.`);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo");
      }

      onUploadSuccess(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        Supporting Photo (Optional)
      </label>

      {currentPhotoUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhotoUrl}
            alt="Complaint upload"
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onRemove}
              leftIcon={<X className="w-4 h-4" />}
            >
              Remove Photo
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white/50 dark:bg-slate-900/50"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : (
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
              )}
            </div>

            <div className="text-xs">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                or drag & drop a photo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              PNG, JPG, WEBP or GIF up to 5MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
