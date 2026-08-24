import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo";
  trend?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  badge,
  onClick,
  className,
}: StatCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      accent: "border-l-blue-500",
      glow: "hover:border-blue-500/40",
      iconBg: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
    },
    emerald: {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accent: "border-l-emerald-500",
      glow: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
    },
    amber: {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accent: "border-l-amber-500",
      glow: "hover:border-amber-500/40",
      iconBg: "bg-amber-600/10 text-amber-600 dark:text-amber-400",
    },
    rose: {
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      accent: "border-l-rose-500",
      glow: "hover:border-rose-500/40",
      iconBg: "bg-rose-600/10 text-rose-600 dark:text-rose-400",
    },
    purple: {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      accent: "border-l-purple-500",
      glow: "hover:border-purple-500/40",
      iconBg: "bg-purple-600/10 text-purple-600 dark:text-purple-400",
    },
    indigo: {
      bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      accent: "border-l-indigo-500",
      glow: "hover:border-indigo-500/40",
      iconBg: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400",
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-card transition-all duration-200",
        "border-l-4",
        scheme.accent,
        scheme.glow,
        onClick && "cursor-pointer hover:shadow-cardHover hover:translate-y-[-2px]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("rounded-xl p-2.5", scheme.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span className={cn("px-2 py-0.5 rounded text-xs font-semibold border", scheme.bg)}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{subtitle}</span>
          {trend && <span className="font-semibold">{trend}</span>}
        </div>
      )}
    </div>
  );
}

export function Spinner({ className = "w-6 h-6", text }: { className?: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={cn("animate-spin rounded-full border-2 border-slate-300 border-t-blue-600", className)} />
      {text && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
}
