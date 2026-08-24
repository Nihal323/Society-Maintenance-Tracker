import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  AlertTriangle,
  Users,
  Camera,
  History,
  FileCheck2,
  Lock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/resident/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-tight">
                SOCIETY TRACKER
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Greenwood Heights
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30">
                Resident Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Modern Residential Management & Maintenance Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Seamless Complaint Tracking for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
              Smart Societies
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate lost maintenance requests. Empower residents to raise complaints with photos, track immutable status timelines, receive real-time updates, and enable admins to resolve tickets with intelligent overdue escalation.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/25 px-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Live Demo
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                Register as Resident
              </Button>
            </Link>
          </div>

          {/* Demo Login Quick Links Card */}
          <div className="mt-14 max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 shadow-2xl text-left">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Instant Demo Credentials
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pre-configured test accounts are ready with sample complaints, overdue tickets, photo uploads, and notice boards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/login?demo=admin" className="block">
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 hover:bg-purple-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">ADMIN CONSOLE</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-xs font-mono text-slate-300 mt-1">admin@society.com</p>
                  <p className="text-[11px] text-slate-400 font-mono">Password: Admin@123</p>
                </div>
              </Link>

              <Link href="/login?demo=resident" className="block">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 hover:bg-blue-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300">RESIDENT PORTAL</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xs font-mono text-slate-300 mt-1">resident@society.com</p>
                  <p className="text-[11px] text-slate-400 font-mono">Password: Resident@123</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Complete Transparency & Fast Resolution
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Built with production best-practices, strict role security, and responsive UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Configurable Overdue Escalation</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Dynamic threshold engine flags aging tickets automatically without database drift. Overdue tickets are immediately highlighted on the administrator dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Immutable Status Audit Timeline</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Every state transition (Open &rarr; In Progress &rarr; Resolved) logs timestamps, actor IDs, and progress notes, building a tamper-proof audit trail for residents and committee members.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Notices & Email Notifications</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Integrated email service with professional templates keeps residents updated whenever their complaint changes status or emergency notices are pinned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">Greenwood Heights Society Management System</span>
          </div>
          <p>&copy; 2026 Society Maintenance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
