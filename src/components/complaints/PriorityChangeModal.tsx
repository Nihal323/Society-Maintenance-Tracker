import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PriorityBadge } from "@/components/ui/Badge";
import { ComplaintData, PriorityLevel } from "@/types";
import { COMPLAINT_PRIORITIES } from "@/lib/constants";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface PriorityChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintData;
  onSuccess: (updated: ComplaintData) => void;
}

export function PriorityChangeModal({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}: PriorityChangeModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(complaint.priority);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPriority === complaint.priority) {
      onClose();
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: selectedPriority,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update priority");
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
      title="Update Complaint Priority"
      description="Adjust the urgency level assigned to this maintenance complaint."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Select Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COMPLAINT_PRIORITIES.map((p) => {
              const isSelected = selectedPriority === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? p === "HIGH"
                        ? "ring-2 ring-rose-500 border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200"
                        : p === "MEDIUM"
                        ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                        : "ring-2 ring-slate-500 border-slate-500 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <PriorityBadge priority={p} />
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          label="Reason for priority adjustment (Optional)"
          placeholder="e.g., Escalated due to safety concerns."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        {error && (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            Update Priority
          </Button>
        </div>
      </form>
    </Modal>
  );
}
