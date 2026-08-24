"use client";

import React, { useState, useEffect } from "react";
import { NoticeData } from "@/types";
import { NOTICE_CATEGORIES } from "@/lib/constants";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import { Bell, Search, Pin, Tag, X } from "lucide-react";

export default function ResidentNoticesPage() {
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

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

  const clearFilters = () => {
    setSearch("");
    setCategory("ALL");
  };

  const pinnedNotices = notices.filter((n) => n.isPinned);
  const regularNotices = notices.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Society Notice Board
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official announcements, maintenance schedules, and emergency updates from management
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Input
              placeholder="Search announcements by keywords..."
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

      {/* Notices List */}
      {isLoading ? (
        <Spinner text="Loading society notices..." />
      ) : notices.length > 0 ? (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>Important & Pinned Announcements</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
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
                  <span>General Announcements</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notices published yet"
          description="Check back later for society notifications and maintenance updates."
        />
      )}
    </div>
  );
}
