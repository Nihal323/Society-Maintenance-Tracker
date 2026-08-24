import React from "react";
import { NoticeData } from "@/types";
import { formatDateShort, formatTimeAgo } from "@/lib/utils";
import { Pin, Calendar, User, Edit2, Trash2, Tag, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NoticeCardProps {
  notice: NoticeData;
  isAdmin?: boolean;
  onEdit?: (notice: NoticeData) => void;
  onDelete?: (notice: NoticeData) => void;
}

export function NoticeCard({ notice, isAdmin = false, onEdit, onDelete }: NoticeCardProps) {
  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all duration-200 ${
        notice.isPinned
          ? "border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/10 shadow-md ring-1 ring-rose-500/20"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-cardHover"
      }`}
    >
      {/* Top Tag & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {notice.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-sm shadow-rose-600/30 uppercase tracking-wide">
              <Pin className="w-3 h-3 fill-current" /> Important Notice
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Tag className="w-3 h-3 text-slate-400" />
            {notice.category}
          </span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(notice)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit notice"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(notice)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notice Title */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
        {notice.title}
      </h3>

      {/* Notice Content */}
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
        {notice.content}
      </p>

      {/* Footer Meta */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>By {notice.author?.name || "Administration"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDateShort(notice.createdAt)} ({formatTimeAgo(notice.createdAt)})</span>
        </div>
      </div>
    </div>
  );
}
