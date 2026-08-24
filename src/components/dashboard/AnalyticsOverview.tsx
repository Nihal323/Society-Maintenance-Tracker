import React from "react";
import { DashboardStats } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert, BarChart3, PieChart, Layers } from "lucide-react";

interface AnalyticsOverviewProps {
  stats: DashboardStats;
}

export function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
  const { statusBreakdown, categoryBreakdown, totalComplaints, resolvedComplaints } = stats;

  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Breakdown & Resolution Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <PieChart className="w-4 h-4" />
              </div>
              <CardTitle>Complaint Status Distribution</CardTitle>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {resolutionRate}% Resolved
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Progress Multi-Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
              {statusBreakdown.map((item) => {
                const color =
                  item.status === "RESOLVED"
                    ? "bg-emerald-500"
                    : item.status === "IN_PROGRESS"
                    ? "bg-blue-500"
                    : "bg-amber-500";
                return (
                  <div
                    key={item.status}
                    style={{ width: `${item.percentage}%` }}
                    className={`${color} transition-all duration-500`}
                    title={`${item.status}: ${item.count} (${item.percentage}%)`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-500"
                        : item.status === "IN_PROGRESS"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="font-medium">
                    {item.status.replace("_", " ")}:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Active Workload
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.openComplaints + stats.inProgressComplaints}
              </p>
              <p className="text-[11px] text-slate-400">Open + In-Progress tickets</p>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Overdue Attention
              </div>
              <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                {stats.overdueComplaints}
              </p>
              <p className="text-[11px] text-slate-400">&gt; {stats.overdueThresholdDays} days unresolved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Bars */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <CardTitle>Complaints by Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No category data available.</p>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.slice(0, 5).map((item) => {
                const maxCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {item.category}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.count} tickets
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
