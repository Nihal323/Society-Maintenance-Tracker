import React from "react";
import { ComplaintHistoryData } from "@/types";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { CheckCircle2, Clock, MessageSquare, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";

interface HistoryTimelineProps {
  history: ComplaintHistoryData[];
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No status history recorded yet.
      </div>
    );
  }

  // Sort chronological ascending (or descending, let's show chronological with latest at bottom or top)
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sorted.map((item, index) => {
        const isLatest = index === sorted.length - 1;
        const isResolution = item.newStatus === "RESOLVED";

        return (
          <div key={item.id || index} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                isResolution
                  ? "border-emerald-500 text-emerald-500 shadow-sm shadow-emerald-500/20"
                  : isLatest
                  ? "border-blue-500 text-blue-500 ring-4 ring-blue-500/10"
                  : "border-slate-300 dark:border-slate-700 text-slate-400"
              }`}
            >
              {isResolution ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : item.newStatus === "IN_PROGRESS" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : item.previousStatus ? (
                <ArrowRight className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Timeline Content Card */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Status:
                  </span>
                  {item.previousStatus && (
                    <>
                      <StatusBadge status={item.previousStatus} showIcon={false} />
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                  <StatusBadge status={item.newStatus} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(item.timestamp)}</span>
                  <span className="text-slate-400 dark:text-slate-600">({formatTimeAgo(item.timestamp)})</span>
                </div>
              </div>

              {/* Actor */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                {item.actor?.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {item.actor?.name || "Administrator"} (Admin)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5" />
                    {item.actor?.name || "Resident"}
                  </span>
                )}
              </div>

              {/* Note */}
              {item.note && (
                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed italic">{item.note}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
