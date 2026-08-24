"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ComplaintData, ComplaintStatusType, PriorityLevel } from "@/types";
import { COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } from "@/lib/constants";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/ui/Badge";
import { HistoryTimeline } from "@/components/complaints/HistoryTimeline";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Home,
  Tag,
  AlertCircle,
  CheckCircle2,
  FileText,
  ImageIcon,
  History,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Send,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function AdminComplaintResolutionPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for resolution update
  const [targetStatus, setTargetStatus] = useState<ComplaintStatusType>("IN_PROGRESS");
  const [targetPriority, setTargetPriority] = useState<PriorityLevel>("MEDIUM");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails();
    }
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/complaints/${complaintId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load complaint");
      }

      setComplaint(data.data);
      setTargetStatus(data.data.status);
      setTargetPriority(data.data.priority);
    } catch (err: any) {
      setError(err.message || "Failed to load complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setUpdateFeedback(null);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus !== complaint.status ? targetStatus : undefined,
          priority: targetPriority !== complaint.priority ? targetPriority : undefined,
          note: resolutionNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update complaint");
      }

      setComplaint(data.data);
      setTargetStatus(data.data.status);
      setTargetPriority(data.data.priority);
      setResolutionNote("");
      setUpdateFeedback({
        type: "success",
        msg: "Complaint updated successfully. Resident notified via email!",
      });
    } catch (err: any) {
      setUpdateFeedback({
        type: "error",
        msg: err.message || "Failed to process update",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Fetching complaint details & history..." />;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Complaint</h2>
        <p className="text-sm text-slate-500">{error || "Complaint not found"}</p>
        <Link href="/admin/complaints">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Complaints Management
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaint Management
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {complaint.isOverdue && <OverdueBadge ageInDays={complaint.ageInDays} />}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported {formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
          {complaint.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category: {complaint.category}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            Unit: {complaint.resident?.unitNumber || "N/A"}
          </span>
          {complaint.resolvedAt && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved on {formatDate(complaint.resolvedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Action Console, Description & Photo */}
        <div className="lg:col-span-7 space-y-6">
          {/* Resolution & Status Transition Toolbar */}
          <Card className="border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/20 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <CardTitle>Resolution & Status Controls</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Status
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["OPEN", "IN_PROGRESS", "RESOLVED"] as ComplaintStatusType[]).map((st) => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setTargetStatus(st)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                            targetStatus === st
                              ? "ring-2 ring-blue-500 border-blue-500 bg-blue-600 text-white shadow-sm"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {st === "IN_PROGRESS" ? "Progress" : st === "RESOLVED" ? "Resolve" : "Open"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Assigned Priority
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["LOW", "MEDIUM", "HIGH"] as PriorityLevel[]).map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setTargetPriority(p)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                            targetPriority === p
                              ? p === "HIGH"
                                ? "ring-2 ring-rose-500 border-rose-500 bg-rose-600 text-white shadow-sm"
                                : p === "MEDIUM"
                                ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-600 text-white shadow-sm"
                                : "ring-2 ring-slate-500 border-slate-500 bg-slate-700 text-white shadow-sm"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress / Resolution Note */}
                <Textarea
                  label="Administrative Progress / Resolution Note"
                  placeholder="e.g., Plumber has replaced the 1.5-inch PVC elbow and tested pressure. Area is dry."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  helperText="This note is permanently recorded in the complaint audit trail and sent to the resident in their email update."
                />

                {updateFeedback && (
                  <div
                    className={`rounded-lg p-3 text-xs flex items-center gap-2 border ${
                      updateFeedback.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200"
                    }`}
                  >
                    {updateFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{updateFeedback.msg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    Resident email notification will dispatch automatically
                  </span>

                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isUpdating}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Save & Update Status
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Issue Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <CardTitle>Complaint Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Photo Preview */}
          {complaint.photoUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <CardTitle>Attached Resident Photo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ImageLightbox
                  src={complaint.photoUrl}
                  alt={`Complaint photo for ${complaint.title}`}
                  className="w-full max-h-80 object-cover rounded-xl"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 5 Columns: Resident Contact Info & Timeline Audit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resident Contact Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <CardTitle>Resident Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  {complaint.resident?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {complaint.resident?.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Home className="w-3 h-3 text-slate-400" />
                    {complaint.resident?.unitNumber || "Unit not provided"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> Email:
                  </span>
                  <a
                    href={`mailto:${complaint.resident?.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {complaint.resident?.email}
                  </a>
                </div>

                {complaint.resident?.phone && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> Phone:
                    </span>
                    <a
                      href={`tel:${complaint.resident.phone}`}
                      className="font-medium text-slate-800 dark:text-slate-200"
                    >
                      {complaint.resident.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Complete Status Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <CardTitle>History Timeline & Audit Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HistoryTimeline history={complaint.history || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
