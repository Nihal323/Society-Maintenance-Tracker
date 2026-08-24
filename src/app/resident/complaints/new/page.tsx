"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { PhotoUploadPreview } from "@/components/complaints/PhotoUploadPreview";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Send, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function RaiseComplaintPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(COMPLAINT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a brief title for the maintenance complaint.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Please describe the issue in more detail (at least 10 characters).");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit complaint");
      }

      // Redirect to the newly created complaint details page
      router.push(`/resident/complaints/${data.data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the complaint.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/resident/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Complaints
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Raise a Maintenance Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit details and optional photos. The society estate manager will inspect and assign technicians.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Maintenance Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                required
              />

              <Input
                label="Complaint Summary / Title *"
                placeholder="e.g., Kitchen sink drain block or Lift jerk"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <Textarea
              label="Detailed Description *"
              placeholder="Describe what is happening, exact location (e.g. Master Bedroom, Basement Parking slot B-14), severity, and any relevant context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            {/* Photo Upload Section */}
            <PhotoUploadPreview
              currentPhotoUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              onRemove={() => setPhotoUrl(null)}
            />

            {error && (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link href="/resident/complaints">
                <Button type="button" variant="outline" size="md">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                size="md"
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
