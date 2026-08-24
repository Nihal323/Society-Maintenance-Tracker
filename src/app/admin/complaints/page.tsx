"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComplaintData, PriorityLevel, ComplaintStatusType } from "@/types";
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "@/lib/constants";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/ui/Badge";
import { StatusChangeModal } from "@/components/complaints/StatusChangeModal";
import { PriorityChangeModal } from "@/components/complaints/PriorityChangeModal";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import { formatDateShort, formatTimeAgo } from "@/lib/utils";
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  Home,
  Tag,
  ImageIcon,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";

function AdminComplaintsContent() {
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get("overdue") === "true");

  // Modal states for quick actions
  const [statusModalComplaint, setStatusModalComplaint] = useState<ComplaintData | null>(null);
  const [priorityModalComplaint, setPriorityModalComplaint] = useState<ComplaintData | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [category, status, priority, overdueOnly]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (status !== "ALL") params.append("status", status);
      if (priority !== "ALL") params.append("priority", priority);
      if (overdueOnly) params.append("overdue", "true");
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
    setPriority("ALL");
    setOverdueOnly(false);
  };

  const handleUpdateSuccess = (updatedComplaint: ComplaintData) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
  };

  const hasActiveFilters =
    search || category !== "ALL" || status !== "ALL" || priority !== "ALL" || overdueOnly;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complaint Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, triage, re-prioritize, and update resolution statuses across all society units
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComplaints}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card space-y-3">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="sm:col-span-4 relative">
            <Input
              placeholder="Search resident, unit, or complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-2">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "ALL", label: "All Categories" },
                ...COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "RESOLVED", label: "Resolved" },
              ]}
            />
          </div>

          {/* Priority Dropdown */}
          <div className="sm:col-span-2">
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: "ALL", label: "All Priorities" },
                { value: "HIGH", label: "High Priority" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LOW", label: "Low" },
              ]}
            />
          </div>

          {/* Overdue Toggle */}
          <div className="sm:col-span-2 flex items-center">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 cursor-pointer w-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Overdue Only
              </span>
            </label>
          </div>
        </form>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">
              Found <strong>{complaints.length}</strong> complaints matching active criteria
            </span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Complaints Data Table */}
      {isLoading ? (
        <Spinner text="Loading society complaints..." />
      ) : complaints.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Complaint Title</th>
                  <th className="px-5 py-3.5">Resident / Unit</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors ${
                      c.isOverdue ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                    }`}
                  >
                    {/* Title */}
                    <td className="px-5 py-4 max-w-xs">
                      <Link
                        href={`/admin/complaints/${c.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600 hover:underline line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                    </td>

                    {/* Resident */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.resident?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {c.resident?.unitNumber || "No unit specified"}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <div className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {c.category}
                      </div>
                      {c.photoUrl && (
                        <div className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5 mt-0.5">
                          <ImageIcon className="w-3 h-3" /> Photo Attached
                        </div>
                      )}
                    </td>

                    {/* Priority (Clickable for quick update) */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setPriorityModalComplaint(c)}
                        title="Click to adjust priority"
                        className="hover:scale-105 transition-transform"
                      >
                        <PriorityBadge priority={c.priority} />
                      </button>
                    </td>

                    {/* Status & Overdue (Clickable for quick update) */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          onClick={() => setStatusModalComplaint(c)}
                          title="Click to change status"
                          className="hover:scale-105 transition-transform text-left"
                        >
                          <StatusBadge status={c.status} />
                        </button>
                        {c.isOverdue && <OverdueBadge ageInDays={c.ageInDays} />}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500">
                      <div>{formatDateShort(c.createdAt)}</div>
                      <div className="text-[11px] text-slate-400">({formatTimeAgo(c.createdAt)})</div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/complaints/${c.id}`}>
                        <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                          Resolve
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title={hasActiveFilters ? "No complaints matched filters" : "No complaints submitted"}
          description={
            hasActiveFilters
              ? "Try resetting search or adjusting your status/category criteria."
              : "No complaints have been filed in the system yet."
          }
          actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      )}

      {/* Quick Status Change Modal */}
      {statusModalComplaint && (
        <StatusChangeModal
          isOpen={!!statusModalComplaint}
          onClose={() => setStatusModalComplaint(null)}
          complaint={statusModalComplaint}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Quick Priority Change Modal */}
      {priorityModalComplaint && (
        <PriorityChangeModal
          isOpen={!!priorityModalComplaint}
          onClose={() => setPriorityModalComplaint(null)}
          complaint={priorityModalComplaint}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}

export default function AdminComplaintsPage() {
  return (
    <Suspense fallback={<Spinner text="Loading complaint management..." />}>
      <AdminComplaintsContent />
    </Suspense>
  );
}
