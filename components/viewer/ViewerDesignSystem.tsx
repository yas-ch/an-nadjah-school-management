"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Premium Glass Card ─────────────────────────────────────────────────
export function GlassCard({ children, className, hover = true, ...props }: {
  children: React.ReactNode; className?: string; hover?: boolean;
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-xl shadow-black/5",
        "hover:shadow-2xl hover:shadow-black/10 transition-all duration-500",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── Gradient Icon Container ────────────────────────────────────────────
const gradientMap: Record<string, string> = {
  blue: "from-blue-500 to-cyan-500 shadow-blue-500/30",
  purple: "from-purple-500 to-pink-500 shadow-purple-500/30",
  emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/30",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/30",
  rose: "from-rose-400 to-pink-500 shadow-rose-500/30",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/30",
  cyan: "from-cyan-400 to-blue-500 shadow-cyan-500/30",
  indigo: "from-indigo-500 to-purple-600 shadow-indigo-500/30",
};

export function GradientIcon({ icon: Icon, color = "blue", size = "md" }: {
  icon: React.ComponentType<{ className?: string }>; color?: string; size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-14 w-14" };
  const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  return (
    <div className={cn(
      "flex items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
      sizes[size], gradientMap[color] || gradientMap.blue
    )}>
      <Icon className={iconSizes[size]} />
    </div>
  );
}

// ─── Premium Stat Card ──────────────────────────────────────────────────
export function PremiumStatCard({ title, value, subtitle, icon, color = "blue", trend, trendValue, chart }: {
  title: string; value: string; subtitle: string; icon: React.ComponentType<{ className?: string }>;
  color?: string; trend?: "up" | "down" | "neutral"; trendValue?: string; chart?: React.ReactNode;
}) {
  const gradientBg: Record<string, string> = {
    blue: "from-blue-50 via-white to-cyan-50",
    purple: "from-purple-50 via-white to-pink-50",
    emerald: "from-emerald-50 via-white to-teal-50",
    amber: "from-amber-50 via-white to-orange-50",
    rose: "from-rose-50 via-white to-pink-50",
    violet: "from-violet-50 via-white to-purple-50",
    cyan: "from-cyan-50 via-white to-blue-50",
    indigo: "from-indigo-50 via-white to-purple-50",
  };
  const borderGlow: Record<string, string> = {
    blue: "border-blue-200/50 hover:border-blue-300/70",
    purple: "border-purple-200/50 hover:border-purple-300/70",
    emerald: "border-emerald-200/50 hover:border-emerald-300/70",
    amber: "border-amber-200/50 hover:border-amber-300/70",
    rose: "border-rose-200/50 hover:border-rose-300/70",
    violet: "border-violet-200/50 hover:border-violet-300/70",
    cyan: "border-cyan-200/50 hover:border-cyan-300/70",
    indigo: "border-indigo-200/50 hover:border-indigo-300/70",
  };
  return (
    <GlassCard className={cn("p-5 lg:p-6 bg-gradient-to-br", gradientBg[color] || gradientBg.blue, borderGlow[color] || borderGlow.blue)}>
      <div className="flex items-start justify-between mb-4">
        <GradientIcon icon={icon} color={color} />
        {trend && trendValue && (
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
            trend === "up" ? "bg-emerald-100/80 text-emerald-700" : trend === "down" ? "bg-red-100/80 text-red-700" : "bg-gray-100/80 text-gray-600"
          )}>
            <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}</span>
            {trendValue}
          </span>
        )}
      </div>
      {chart && <div className="mb-3">{chart}</div>}
      <div>
        <p className="text-sm font-medium text-gray-500/80">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
      </div>
    </GlassCard>
  );
}

// ─── Glowing Badge ──────────────────────────────────────────────────────
export function GlowBadge({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100/80 text-blue-700 border-blue-200/50 shadow-blue-500/10",
    emerald: "bg-emerald-100/80 text-emerald-700 border-emerald-200/50 shadow-emerald-500/10",
    amber: "bg-amber-100/80 text-amber-700 border-amber-200/50 shadow-amber-500/10",
    red: "bg-red-100/80 text-red-700 border-red-200/50 shadow-red-500/10",
    purple: "bg-purple-100/80 text-purple-700 border-purple-200/50 shadow-purple-500/10",
    rose: "bg-rose-100/80 text-rose-700 border-rose-200/50 shadow-rose-500/10",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border shadow-sm backdrop-blur-sm",
      colors[color] || colors.blue
    )}>
      {children}
    </span>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────
export function ViewSectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Mini Sparkline ─────────────────────────────────────────────────────
export function MiniSparkline({ data = [30, 45, 60, 55, 70, 85], color = "#3b82f6" }: {
  data?: number[]; color?: string;
}) {
  const h = 32; const w = 80;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polygon fill={`url(#grad-${color.replace("#", "")})`} points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

// ─── Animated Progress Circle ───────────────────────────────────────────
export function ProgressCircle({ value = 0, size = 60, strokeWidth = 5, color = "#3b82f6", label }: {
  value: number; size?: number; strokeWidth?: number; color?: string; label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span className="text-sm font-bold text-gray-900">{Math.round(value)}%</span>
      {label && <span className="text-[10px] text-gray-400">{label}</span>}
    </div>
  );
}
