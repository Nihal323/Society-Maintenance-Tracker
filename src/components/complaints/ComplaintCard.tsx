import React from "react";
import Link from "next/link";
import { ComplaintData } from "@/types";
import { formatDateShort, formatTimeAgo } from "@/lib/utils";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight, Calendar, Home, Image as ImageIcon, MessageSquare, Tag, User } from "lucide-react";

interface ComplaintCardProps {
  complaint: ComplaintData;
  basePath?: "/resident/complaints" | "/admin/complaints";
  showResidentInfo?: boolean;
}

export function ComplaintCard({
  complaint,
  basePath = "/resident/complaints",
  showResidentInfo = false,
}: ComplaintCardProps) {
  const detailUrl = `${basePath}/${complaint.id}`;

  return (
    <Card
      hoverable
      className={`relative overflow-hidden transition-all duration-200 ${
        complaint.isOverdue
          ? "border-rose-500/40 bg-rose-500/[0.02] dark:bg-rose-950/[0.05]"
          : ""
      }`}
    >
      <div className="p-5">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.isOverdue && (
              <OverdueBadge ageInDays={complaint.ageInDays} />
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatTimeAgo(complaint.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link href={detailUrl} className="group block">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {/* Meta / Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {complaint.category}
            </span>

            {complaint.photoUrl && (
              <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <ImageIcon className="w-3.5 h-3.5" />
                Photo Attached
              </span>
            )}

            {showResidentInfo && complaint.resident && (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                {complaint.resident.unitNumber || complaint.resident.name}
              </span>
            )}
          </div>

          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
