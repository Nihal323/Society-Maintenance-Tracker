import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { NoticeData } from "@/types";
import { NOTICE_CATEGORIES } from "@/lib/constants";
import { Pin, Send, AlertCircle, Mail } from "lucide-react";

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: NoticeData | null;
  onSuccess: (notice: NoticeData) => void;
}

export function NoticeFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: NoticeFormModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategory(initialData.category || "General");
      setIsPinned(initialData.isPinned);
    } else {
      setTitle("");
      setContent("");
      setCategory("General");
      setIsPinned(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content.");
      return;
    }

    try {
      setIsLoading(true);
      const url = initialData ? `/api/notices/${initialData.id}` : "/api/notices";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          isPinned,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save notice");
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Notice" : "Publish Society Notice"}
      description={
        initialData
          ? "Update the details of this announcement"
          : "Create an official announcement for society residents"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Notice Title *"
          placeholder="e.g., Annual General Body Meeting or Water Tank Maintenance"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={NOTICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Pin className={`w-3.5 h-3.5 ${isPinned ? "text-rose-500 fill-current" : "text-slate-400"}`} />
                <span>Mark as Important (Pin to Top)</span>
              </div>
            </label>
          </div>
        </div>

        <Textarea
          label="Notice Content *"
          placeholder="Enter complete details, timings, instructions for residents..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
        />

        {isPinned && !initialData && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              <strong>Email Broadcast:</strong> Marking as <em>Important</em> will automatically send an email announcement to all registered residents!
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            leftIcon={initialData ? undefined : <Send className="w-4 h-4" />}
          >
            {initialData ? "Save Changes" : "Publish Notice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
