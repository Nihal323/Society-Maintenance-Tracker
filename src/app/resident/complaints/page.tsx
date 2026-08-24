"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ComplaintData } from "@/types";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from "@/lib/constants";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import { PlusCircle, Search, Filter, RefreshCw, X } from "lucide-react";

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    fetchComplaints();
  }, [category, status]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (status !== "ALL") params.append("status", status);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
  };

  const hasActiveFilters = search || category !== "ALL" || status !== "ALL";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Maintenance Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View history, track technician status, and inspect resolution notes
          </p>
        </div>
        <Link href="/resident/complaints/new">
          <Button leftIcon={<PlusCircle className="w-4 h-4" />}>
            Raise New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Input
              placeholder="Search by keyword, issue, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "ALL", label: "All Categories" },
                ...COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "OPEN", label: "Open Only" },
                { value: "IN_PROGRESS", label: "In Progress Only" },
                { value: "RESOLVED", label: "Resolved Only" },
              ]}
            />
          </div>
        </form>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Showing filtered results ({complaints.length} tickets found)
            </span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Complaint Cards Grid */}
      {isLoading ? (
        <Spinner text="Loading complaints..." />
      ) : complaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              basePath="/resident/complaints"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? "No matching complaints" : "No complaints submitted yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search query or removing category/status filters."
              : "Whenever you notice maintenance or repair issues in your unit or common areas, click below to submit a ticket."
          }
          actionLabel={hasActiveFilters ? "Reset Filters" : "Raise New Complaint"}
          onAction={hasActiveFilters ? clearFilters : () => window.location.assign("/resident/complaints/new")}
        />
      )}
    </div>
  );
}
