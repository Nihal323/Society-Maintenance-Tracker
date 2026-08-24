"use client";

import React, { useState, useEffect } from "react";
import { SystemConfigMap, PriorityLevel } from "@/types";
import { COMPLAINT_PRIORITIES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import {
  Settings,
  Clock,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  Cpu
} from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfigMap>({
    OVERDUE_THRESHOLD_DAYS: 3,
    SOCIETY_NAME: "Greenwood Heights Residents Association",
    DEFAULT_PRIORITY: "MEDIUM",
    SOCIETY_ADDRESS: "42 Orchid Boulevard, Block 4, Silicon Oasis",
    CONTACT_PHONE: "+1 (555) 019-2834",
    CONTACT_EMAIL: "helpdesk@greenwoodheights.org",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OVERDUE_THRESHOLD_DAYS: Number(config.OVERDUE_THRESHOLD_DAYS),
          SOCIETY_NAME: config.SOCIETY_NAME,
          DEFAULT_PRIORITY: config.DEFAULT_PRIORITY,
          SOCIETY_ADDRESS: config.SOCIETY_ADDRESS,
          CONTACT_PHONE: config.CONTACT_PHONE,
          CONTACT_EMAIL: config.CONTACT_EMAIL,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update configuration");
      }

      setFeedback({
        type: "success",
        msg: "System configuration and overdue thresholds saved successfully!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err.message || "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Loading system parameters & configuration..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
          <Settings className="w-3.5 h-3.5" /> Society Policy & Engine Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure overdue detection thresholds, default ticket priority, and society metadata
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Overdue & SLA Configuration Card */}
        <Card className="border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/15 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <div>
                <CardTitle>Complaint Overdue Detection Engine</CardTitle>
                <CardDescription>
                  Configure the SLA age threshold before unresolved maintenance tickets are dynamically flagged as Overdue.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <Input
                label="Overdue Threshold (Days) *"
                type="number"
                min={1}
                max={30}
                value={config.OVERDUE_THRESHOLD_DAYS}
                onChange={(e) =>
                  setConfig({ ...config, OVERDUE_THRESHOLD_DAYS: parseInt(e.target.value, 10) || 1 })
                }
                helperText="Unresolved complaints older than this number of days will be highlighted in red across all admin dashboards."
                required
              />

              <Select
                label="Default New Ticket Priority *"
                value={config.DEFAULT_PRIORITY}
                onChange={(e) =>
                  setConfig({ ...config, DEFAULT_PRIORITY: e.target.value as PriorityLevel })
                }
                options={COMPLAINT_PRIORITIES.map((p) => ({ value: p, label: p }))}
                helperText="Initial priority assigned when a resident submits a complaint."
              />
            </div>
          </CardContent>
        </Card>

        {/* Society Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <div>
                <CardTitle>Society Identity & Contact Info</CardTitle>
                <CardDescription>
                  Details displayed on resident portals and email dispatch notifications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Official Society Name *"
              value={config.SOCIETY_NAME}
              onChange={(e) => setConfig({ ...config, SOCIETY_NAME: e.target.value })}
              required
            />

            <Input
              label="Physical Address / Campus"
              value={config.SOCIETY_ADDRESS || ""}
              onChange={(e) => setConfig({ ...config, SOCIETY_ADDRESS: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Helpdesk Contact Phone"
                value={config.CONTACT_PHONE || ""}
                onChange={(e) => setConfig({ ...config, CONTACT_PHONE: e.target.value })}
              />

              <Input
                label="Helpdesk Contact Email"
                type="email"
                value={config.CONTACT_EMAIL || ""}
                onChange={(e) => setConfig({ ...config, CONTACT_EMAIL: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Diagnostics & Engine Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <CardTitle>Environment Diagnostics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-slate-400 font-medium">Database ORM</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Prisma 5.22 (SQLite/PG)</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-slate-400 font-medium">Framework</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Next.js 14 App Router</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-slate-400 font-medium">Email Dispatcher</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Resend + Dev Logger</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-slate-400 font-medium">Photo Storage</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Local / Public Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {feedback && (
          <div
            className={`rounded-xl p-4 text-xs flex items-center gap-2.5 border ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="font-medium">{feedback.msg}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
