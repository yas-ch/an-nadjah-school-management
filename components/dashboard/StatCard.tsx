"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const iconBgClasses: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  purple: "from-violet-500 to-violet-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  indigo: "from-indigo-500 to-indigo-600",
};

const iconRingClasses: Record<string, string> = {
  blue: "shadow-blue-500/20",
  green: "shadow-emerald-500/20",
  purple: "shadow-violet-500/20",
  orange: "shadow-orange-500/20",
  red: "shadow-red-500/20",
  indigo: "shadow-indigo-500/20",
};

const badgeClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            iconBgClasses[color],
            iconRingClasses[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        {trend && trendValue && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              trend === "up" && "bg-emerald-50 text-emerald-600",
              trend === "down" && "bg-red-50 text-red-600",
              trend === "neutral" && "bg-gray-50 text-gray-600"
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trendValue}
          </span>
        )}

        {!trend && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              badgeClasses[color]
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}
