"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardStats, ComplaintData } from "@/types";
import { StatCard, Spinner } from "@/components/ui/StatCard";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDateShort, formatTimeAgo } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Settings,
  Bell,
  Home,
  Tag,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Loading society maintenance analytics & tickets..." />;
  }

  const overdueComplaints =
    stats?.recentComplaints?.filter((c) => c.isOverdue) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Estate Operations & Resolution Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time complaint telemetry, overdue ticket alerts, and society service performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/notices">
            <Button variant="outline" size="sm" leftIcon={<Bell className="w-4 h-4" />}>
              Publish Notice
            </Button>
          </Link>
          <Link href="/admin/complaints">
            <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Manage Complaints
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Primary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalComplaints || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Open"
          value={stats?.openComplaints || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressComplaints || 0}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedComplaints || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueComplaints || 0}
          subtitle={`> ${stats?.overdueThresholdDays}d unresolved`}
          icon={ShieldAlert}
          color="rose"
          badge={stats && stats.overdueComplaints > 0 ? "ATTN" : undefined}
        />
        <StatCard
          title="High Priority"
          value={stats?.highPriorityComplaints || 0}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Overdue Urgent Alert Box (if any overdue tickets exist) */}
      {stats && stats.overdueComplaints > 0 && (
        <div className="rounded-2xl border border-rose-300 dark:border-rose-900/80 bg-rose-50/70 dark:bg-rose-950/20 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  {stats.overdueComplaints} Maintenance Ticket(s) Require Immediate Attention
                </h3>
                <p className="text-xs text-rose-700/90 dark:text-rose-400 mt-0.5">
                  These complaints have remained unresolved beyond the configured {stats.overdueThresholdDays}-day SLA threshold.
                </p>
              </div>
            </div>

            <Link href="/admin/complaints?overdue=true">
              <Button size="sm" variant="danger" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Filter Overdue Tickets
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Visual Charts & Category Distributions */}
      {stats && <AnalyticsOverview stats={stats} />}

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Maintenance Submissions</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Latest tickets raised across all society units</p>
            </div>
            <Link href="/admin/complaints">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Complaint</th>
                  <th className="px-6 py-3.5">Resident & Unit</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reported</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.recentComplaints?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      <Link href={`/admin/complaints/${c.id}`} className="hover:text-blue-600 hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="font-medium">{c.resident?.name}</div>
                      <div className="text-[11px] text-slate-400">{c.resident?.unitNumber || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {c.category}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={c.status} />
                        {c.isOverdue && <OverdueBadge ageInDays={c.ageInDays} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatTimeAgo(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/complaints/${c.id}`}>
                        <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
