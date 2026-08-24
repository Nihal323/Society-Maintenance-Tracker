"use client";

import React, { useState, useEffect } from "react";
import { UserSession } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/StatCard";
import { User, Mail, Home, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResidentProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner text="Loading profile data..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Resident Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your registered apartment unit details and contact information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <p className="text-xs text-slate-500">{user.role} Member</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-blue-500" /> Unit / Flat Number
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user.unitNumber || "Not Specified"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> Registered Email
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user.email}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-500" /> Phone Number
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user.phone || "Not Provided"}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Society Authentication Active</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                Your maintenance tickets are encrypted and routed directly to estate supervisors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
