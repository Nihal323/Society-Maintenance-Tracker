"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserSession } from "@/types";
import {
  Building2,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  Home,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  user: UserSession;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user.role === "ADMIN";

  const residentNavItems: NavItem[] = [
    { label: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard },
    { label: "My Complaints", href: "/resident/complaints", icon: FileText },
    { label: "Raise Complaint", href: "/resident/complaints/new", icon: PlusCircle, highlight: true },
    { label: "Notice Board", href: "/resident/notices", icon: Bell },
    { label: "Profile", href: "/resident/profile", icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "All Complaints", href: "/admin/complaints", icon: FileText },
    { label: "Notices", href: "/admin/notices", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : residentNavItems;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link
              href={isAdmin ? "/admin/dashboard" : "/resident/dashboard"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight">
                  SOCIETY TRACKER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {isAdmin ? "Admin Console" : "Resident Portal"}
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAdmin
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Home className="w-3 h-3" />}
              {user.role}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                    item.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                      : isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {user.unitNumber || user.email}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              title="Log out"
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2 animate-fade-in shadow-xl">
          <div className="py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.unitNumber || user.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {user.role}
            </span>
          </div>

          <div className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.highlight
                      ? "bg-blue-600 text-white font-semibold"
                      : isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Log Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
