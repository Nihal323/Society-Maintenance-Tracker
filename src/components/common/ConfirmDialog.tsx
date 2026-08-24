import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
