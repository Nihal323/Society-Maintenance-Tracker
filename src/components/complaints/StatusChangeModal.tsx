import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { ComplaintData, ComplaintStatusType } from "@/types";
import { ArrowRight, CheckCircle2, Clock, AlertCircle, Mail } from "lucide-react";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintData;
  onSuccess: (updated: ComplaintData) => void;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatusType>(
    complaint.status === "OPEN"
      ? "IN_PROGRESS"
      : complaint.status === "IN_PROGRESS"
      ? "RESOLVED"
      : "IN_PROGRESS"
  );
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableStatuses: ComplaintStatusType[] = ["OPEN", "IN_PROGRESS", "RESOLVED"].filter(
    (s) => s !== complaint.status
  ) as ComplaintStatusType[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
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
      title="Update Complaint Status"
      description={`Update status and notify resident (${complaint.resident?.name || "Resident"})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Transition Header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Status Transition
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} />
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedStatus === st
                      ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                      : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {st === "IN_PROGRESS" ? "In Progress" : st === "RESOLVED" ? "Resolved" : "Open"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note / Remarks */}
        <Textarea
          label="Resolution / Progress Note"
          placeholder={
            selectedStatus === "RESOLVED"
              ? "e.g., Replacement completed, water line pressure tested and restored."
              : "e.g., Technician assigned for site inspection tomorrow at 10 AM."
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          helperText="This note will be recorded permanently in the timeline and included in the email notification."
          rows={3}
        />

        {/* Email Notification Alert */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-3 flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
          <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            An automated email notification will be dispatched to{" "}
            <strong>{complaint.resident?.email || "the resident"}</strong> upon saving.
          </span>
        </div>

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
          <Button type="submit" size="sm" isLoading={isLoading}>
            Confirm Status Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}
