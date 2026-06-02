"use client";

import { motion } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Clock, Star, Gavel, BookOpen, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import { GlassCard, PremiumStatCard, GlowBadge, ViewSectionHeader } from "./ViewerDesignSystem";

interface AttendanceItem {
  id: string; status: string; date: string | Date; class?: { name: string; teacher?: { name: string } } | null;
  student?: { name: string } | null; time?: string | null; subject?: string | null; justified?: boolean | null; notes?: string | null;
}
interface Props { attendance: AttendanceItem[]; role: string; }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const statusStyles: Record<string, string> = {
  present: "bg-emerald-100/80 text-emerald-700 border-emerald-200/50 shadow-emerald-500/10",
  absent: "bg-red-100/80 text-red-700 border-red-200/50 shadow-red-500/10",
  late: "bg-amber-100/80 text-amber-700 border-amber-200/50 shadow-amber-500/10",
};
const statusIcons: Record<string, React.ReactNode> = {
  present: <CheckCircle className="h-3 w-3" />,
  absent: <XCircle className="h-3 w-3" />,
  late: <Clock className="h-3 w-3" />,
};

const MONTH_KEYS = ["months.january", "months.february", "months.march", "months.april", "months.may", "months.june", "months.july", "months.august", "months.september", "months.october", "months.november", "months.december"];

export default function ViewerAttendanceClient({ attendance, role }: Props) {
  const { t } = useI18n();
  const total = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const justifiedCount = attendance.filter((a) => a.justified).length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : null;

  const monthly: Record<string, { present: number; absent: number; late: number }> = {};
  attendance.forEach((a) => {
    const d = new Date(String(a.date));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly[key]) monthly[key] = { present: 0, absent: 0, late: 0 };
    monthly[key][a.status as "present" | "absent" | "late"]++;
  });
  const monthlyData = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v.present + v.absent + v.late), 1);

  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Premium Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 lg:p-8 shadow-2xl shadow-emerald-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="h-5 w-5 text-emerald-200" />
            <span className="text-emerald-200/80 text-sm font-medium">{t('student.attendanceTitle')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.attendanceTitle')}</h1>
          <p className="text-emerald-100/80 text-sm mt-1">{total} {total !== 1 ? t('common.record_other') : t('common.record_one')} · {rate ? `${rate}% rate` : ""}</p>
        </div>
      </motion.div>

      {/* Premium Stats */}
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumStatCard title={t('student.attendanceRate')} value={rate ? `${rate}%` : "—"} subtitle={`${presentCount}/${total} ${t('common.present').toLowerCase()}`} icon={Calendar} color="emerald" trend={rate && parseFloat(rate) >= 80 ? "up" : "neutral"} trendValue={rate || ""} />
        <PremiumStatCard title={t('common.absent')} value={String(absentCount)} subtitle={`${justifiedCount} justified`} icon={XCircle} color="rose" trend={absentCount > lateCount ? "down" : "neutral"} trendValue={`${absentCount}`} />
        <PremiumStatCard title={t('common.late')} value={String(lateCount)} subtitle={total > 0 ? `${((lateCount / total) * 100).toFixed(0)}% ${t('common.total').toLowerCase()}` : ""} icon={Clock} color="amber" trend="neutral" trendValue={`${lateCount}`} />
        <PremiumStatCard title="Justified" value={String(justifiedCount)} subtitle={absentCount > 0 ? `${((justifiedCount / Math.max(absentCount, 1)) * 100).toFixed(0)}% of absences` : ""} icon={Gavel} color="blue" trend="neutral" trendValue={`${justifiedCount}`} />
      </motion.div>

      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <motion.div variants={fadeUp}>
          <ViewSectionHeader title={t('student.monthlyAttendance')} subtitle={t('student.attendanceSummary')} />
          <GlassCard className="p-6 lg:p-8">
            <div className="flex items-end gap-3 sm:gap-6 h-52">
              {monthlyData.map(([key, data], i) => {
                const totalM = data.present + data.absent + data.late;
                const pct = (totalM / maxMonthly) * 100;
                const pPct = totalM > 0 ? (data.present / totalM) * 100 : 0;
                const aPct = totalM > 0 ? (data.absent / totalM) * 100 : 0;
                const lPct = totalM > 0 ? (data.late / totalM) * 100 : 0;
                return (
                  <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full max-w-[52px] rounded-xl bg-gray-50 overflow-hidden border border-gray-100" style={{ height: `${Math.max(pct, 10)}%` }}>
                      <motion.div initial={{ height: "0%" }} animate={{ height: `${pPct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg" />
                      <motion.div initial={{ height: "0%" }} animate={{ height: `${aPct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-red-400 to-red-300 rounded-t-lg" />
                      <motion.div initial={{ height: "0%" }} animate={{ height: `${lPct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-900">{t(MONTH_KEYS[parseInt(key.split("-")[1]) - 1])}</p>
                      <p className="text-[10px] text-gray-400">{totalM}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-400" /> {t('common.present')}</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-400" /> {t('common.absent')}</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400" /> {t('common.late')}</span>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* History Table */}
      <motion.div variants={fadeUp}>
        <ViewSectionHeader title={t('student.myAttendance')} subtitle="Detailed attendance history" />
        {attendance.length === 0 ? (
          <EmptyState icon={Calendar} title={t('common.noAttendance')} description={t('common.noAttendance')} />
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                    {[t('common.date'), "Time", t('admin.subject'), ...(role === "parent" ? ["Student"] : []), t('admin.className'), t('common.status'), "Justified", t('common.notes')].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendance.map((a, i) => (
                    <motion.tr key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015 }}
                      className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-cyan-50/30 transition-all duration-200"
                    >
                      <td className="px-5 py-4"><span className="font-semibold text-gray-900">{new Date(String(a.date)).toLocaleDateString()}</span></td>
                      <td className="px-5 py-4 text-gray-600">{a.time || "—"}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                          {a.subject || "—"}
                        </span>
                      </td>
                      {role === "parent" && <td className="px-5 py-4"><span className="font-semibold text-gray-700">{a.student?.name || ""}</span></td>}
                      <td className="px-5 py-4 text-gray-600">
                        <span className="text-sm">
                          {(a as any).class?.name || ""}
                          {(a as any).class?.teacher?.name ? ` (${(a as any).class.teacher.name})` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border shadow-sm backdrop-blur-sm ${statusStyles[a.status] || "bg-gray-100 text-gray-700"}`}>
                          {statusIcons[a.status]}
                          {t(`common.${a.status}`)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${a.justified ? "bg-blue-100 text-blue-700 ring-blue-600/20" : "bg-gray-100 text-gray-600 ring-gray-400/20"}`}>
                          <Gavel className="h-3 w-3" />
                          {a.justified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm max-w-[150px] truncate">{a.notes || "—"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </motion.div>
  );
}