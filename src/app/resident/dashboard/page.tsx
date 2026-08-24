"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardStats, NoticeData, ComplaintData } from "@/types";
import { StatCard, Spinner } from "@/components/ui/StatCard";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Bell,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export default function ResidentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Loading your dashboard & maintenance requests..." />;
  }

  const activeComplaintsCount = (stats?.openComplaints || 0) + (stats?.inProgressComplaints || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Resident Self-Service Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Maintenance Desk
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Report maintenance issues around your unit and common society premises, upload supporting photos, and monitor progress in real-time.
          </p>
          <div className="pt-2">
            <Link href="/resident/complaints/new">
              <Button
                variant="glass"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-lg"
              >
                Raise Maintenance Ticket
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={stats?.totalComplaints || 0}
          subtitle="All tickets filed by you"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Active / In Progress"
          value={activeComplaintsCount}
          subtitle="Awaiting resolution"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedComplaints || 0}
          subtitle="Fixed & closed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueComplaints || 0}
          subtitle={`> ${stats?.overdueThresholdDays || 3} days open`}
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Pinned Important Notices Alert Banner */}
      {stats?.pinnedNotices && stats.pinnedNotices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Important Society Announcements
              </h2>
            </div>
            <Link
              href="/resident/notices"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all notices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.pinnedNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Recent Complaints
            </h2>
            <p className="text-xs text-slate-500">Track status and review technician notes</p>
          </div>
          <Link href="/resident/complaints">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Complaints
            </Button>
          </Link>
        </div>

        {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                basePath="/resident/complaints"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No complaints submitted yet"
            description="Whenever an issue arises in your apartment or common area, raise a ticket here for prompt assistance."
            actionLabel="Raise First Complaint"
            onAction={() => window.location.assign("/resident/complaints/new")}
          />
        )}
      </div>
    </div>
  );
}
