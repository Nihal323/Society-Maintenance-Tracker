"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const demo = searchParams.get("demo");
    if (demo === "admin") {
      setEmail("admin@society.com");
      setPassword("Admin@123");
    } else if (demo === "resident") {
      setEmail("resident@society.com");
      setPassword("Resident@123");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password");
      }

      if (data.data.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/resident/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@society.com");
    setPassword("Admin@123");
    setError(null);
  };

  const fillResidentCredentials = () => {
    setEmail("resident@society.com");
    setPassword("Resident@123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Greenwood Heights Maintenance Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
          {/* Quick Demo Selector */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Quick Demo Fill</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Demo
              </button>
              <button
                type="button"
                onClick={fillResidentCredentials}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Resident Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., resident@society.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Are you a new resident?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
