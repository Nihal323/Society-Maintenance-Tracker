"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  User,
  Home,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    unitNumber: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register account");
      }

      // Registration sets cookie and logs user in directly as RESIDENT
      router.push("/resident/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Resident Registration
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Create an account to submit complaints & receive society updates
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="e.g., Emily Watson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-slate-950 border-slate-800 text-white"
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g., emily@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-slate-950 border-slate-800 text-white"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Flat / Unit No. *"
                placeholder="e.g., Tower C - 302"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                required
                className="bg-slate-950 border-slate-800 text-white"
              />

              <Input
                label="Phone Number"
                placeholder="e.g., +1 555-0192"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>

            <Input
              label="Password *"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="bg-slate-950 border-slate-800 text-white"
            />

            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
