"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ComplaintData } from "@/types";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { StatusBadge, PriorityBadge, OverdueBadge } from "@/components/ui/Badge";
import { HistoryTimeline } from "@/components/complaints/HistoryTimeline";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  ShieldCheck
} from "lucide-react";

export default function ResidentComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(data.error || "Failed to load complaint details");
      }

      setComplaint(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaint details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Fetching complaint details & history timeline..." />;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Complaint</h2>
        <p className="text-sm text-slate-500">{error || "Complaint not found or unauthorized."}</p>
        <Link href="/resident/complaints">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to My Complaints
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/resident/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Complaints
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Description & Photo */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <CardTitle>Issue Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Attached Photo */}
          {complaint.photoUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <CardTitle>Attached Supporting Photo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ImageLightbox
                  src={complaint.photoUrl}
                  alt={`Photo for complaint: ${complaint.title}`}
                  className="w-full max-h-80 object-cover rounded-xl"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Status Timeline & Audit Trail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <CardTitle>Status History & Notes</CardTitle>
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
