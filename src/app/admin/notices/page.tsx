"use client";

import React, { useState, useEffect } from "react";
import { NoticeData } from "@/types";
import { NOTICE_CATEGORIES } from "@/lib/constants";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { NoticeFormModal } from "@/components/notices/NoticeFormModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import { Bell, PlusCircle, Search, Pin, Tag, Trash2, Edit2, AlertCircle } from "lucide-react";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeData | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<NoticeData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [category]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/notices?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNotices(data.data);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleCreateOrEditSuccess = (savedNotice: NoticeData) => {
    if (editingNotice) {
      setNotices((prev) =>
        prev.map((n) => (n.id === savedNotice.id ? savedNotice : n))
      );
    } else {
      setNotices((prev) => [savedNotice, ...prev]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNotice) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/notices/${deletingNotice.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotices((prev) => prev.filter((n) => n.id !== deletingNotice.id));
        setDeletingNotice(null);
      }
    } catch (error) {
      console.error("Failed to delete notice:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const pinnedNotices = notices.filter((n) => n.isPinned);
  const regularNotices = notices.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notice Board Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish official announcements, maintenance schedules, and broadcast urgent resident notices
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Publish New Notice
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Input
              placeholder="Search notices by title, content, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="sm:col-span-4">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "ALL", label: "All Categories" },
                ...NOTICE_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
        </form>
      </div>

      {/* Notices View */}
      {isLoading ? (
        <Spinner text="Loading notices..." />
      ) : notices.length > 0 ? (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>Important & Pinned Notices ({pinnedNotices.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    isAdmin={true}
                    onEdit={(n) => setEditingNotice(n)}
                    onDelete={(n) => setDeletingNotice(n)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Section */}
          {regularNotices.length > 0 && (
            <div className="space-y-3">
              {pinnedNotices.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
                  <Bell className="w-3.5 h-3.5" />
                  <span>General Announcements ({regularNotices.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    isAdmin={true}
                    onEdit={(n) => setEditingNotice(n)}
                    onDelete={(n) => setDeletingNotice(n)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notices found"
          description="Create your first society notice or broadcast an important update to residents."
          actionLabel="Publish First Notice"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Modal */}
      <NoticeFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateOrEditSuccess}
      />

      {/* Edit Modal */}
      {editingNotice && (
        <NoticeFormModal
          isOpen={!!editingNotice}
          onClose={() => setEditingNotice(null)}
          initialData={editingNotice}
          onSuccess={handleCreateOrEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingNotice && (
        <ConfirmDialog
          isOpen={!!deletingNotice}
          onClose={() => setDeletingNotice(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Notice"
          message={`Are you sure you want to permanently delete "${deletingNotice.title}"? This action cannot be undone.`}
          confirmLabel="Delete Notice"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
