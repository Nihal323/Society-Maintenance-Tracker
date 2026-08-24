import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/constants";
import { ComplaintStatusType, PriorityLevel } from "@/types";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatusType;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.OPEN;

  const renderIcon = () => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500 animate-spin" style={{ animationDuration: "4s" }} />;
      case "OPEN":
      default:
        return <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
        config.bg,
        className
      )}
    >
      {showIcon && renderIcon()}
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        config.badge,
        className
      )}
    >
      {priority === "HIGH" && <AlertTriangle className="w-3 h-3 mr-1 text-rose-500 animate-pulse" />}
      {config.label}
    </span>
  );
}

interface OverdueBadgeProps {
  ageInDays?: number;
  className?: string;
}

export function OverdueBadge({ ageInDays, className }: OverdueBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm animate-pulse-subtle",
        className
      )}
    >
      <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600 dark:text-rose-400" />
      OVERDUE {ageInDays !== undefined ? `(${ageInDays}d)` : ""}
    </span>
  );
}
