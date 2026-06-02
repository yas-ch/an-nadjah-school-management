"use client";

import { motion } from "framer-motion";
import { BarChart3, ClipboardList, TrendingUp, Download, Activity, Award, FileText, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import EmptyState from "@/components/admin/EmptyState";
import { GlassCard, GradientIcon, PremiumStatCard, GlowBadge, ViewSectionHeader, MiniSparkline, ProgressCircle } from "./ViewerDesignSystem";

interface Props { avgScore: string | null; passRate: string | null; gradesCount: number; role: string; }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const REPORT_KEYS = [
  { labelKey: "student.reportAcademic", descKey: "student.gradeSummary", icon: ClipboardList, gradient: "from-blue-500 to-cyan-600", bg: "bg-blue-50" },
  { labelKey: "student.reportAttendance", descKey: "student.attendanceSummary", icon: BarChart3, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
  { labelKey: "student.reportProgress", descKey: "student.performanceSummary", icon: TrendingUp, gradient: "from-purple-500 to-pink-600", bg: "bg-purple-50" },
];

export default function ViewerReportsClient({ avgScore, passRate, gradesCount, role }: Props) {
  const { t } = useI18n();
  const reports = REPORT_KEYS.map((r) => ({ ...r, label: t(r.labelKey), desc: t(r.descKey) }));
  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Premium Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-800 p-6 lg:p-8 shadow-2xl shadow-pink-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-purple-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <FileText className="h-5 w-5 text-pink-200" />
            <span className="text-pink-200/80 text-sm font-medium">{t('nav.reports')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.reportsTitle')}</h1>
          <p className="text-pink-100/80 text-sm mt-1">{t('student.reportAcademic')} {t('common.analytics')}</p>
        </div>
      </motion.div>

      {/* Download Cards */}
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((item, i) => (
          <GlassCard key={item.label} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                <item.icon className="h-5 w-5" />
              </div>
              <button className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 transition-all border border-gray-200/50 shadow-sm">
                <Download className="h-3.5 w-3.5" /> {t('student.downloadPdf')}
              </button>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Performance Summary */}
      {gradesCount > 0 && (
        <motion.div variants={fadeUp}>
          <ViewSectionHeader title={t('student.performanceSummary')} subtitle="Key metrics at a glance" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <PremiumStatCard title={t('student.averageScore')} value={avgScore ? `${avgScore}%` : "—"} subtitle={t('common.overview')} icon={Award} color="blue" chart={<MiniSparkline data={[40, 55, 60, 65, 70, avgScore ? parseFloat(avgScore) : 65]} color="#3b82f6" />} />
            <PremiumStatCard title={t('student.performanceSummary')} value={passRate ? `${passRate}%` : "—"} subtitle={t('student.gradeSummary')} icon={TrendingUp} color="emerald" chart={<MiniSparkline data={[50, 55, 65, 70, 75, passRate ? parseFloat(passRate) : 70]} color="#10b981" />} />
            <GlassCard className="p-6 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/80">
              <GradientIcon icon={ClipboardList} color="violet" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500/80">{t('admin.totalGrades')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{gradesCount}</p>
                <p className="text-xs text-gray-400 mt-1">{t('common.acrossAll')}</p>
              </div>
            </GlassCard>
            <GlassCard className="p-6 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80">
              <GradientIcon icon={Activity} color="amber" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500/80">{t('common.status')}</p>
                <p className={`text-3xl font-bold mt-1 ${passRate && parseFloat(passRate) >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                  {passRate && parseFloat(passRate) >= 70 ? t('common.active') : t('common.inactive')}
                </p>
                <p className="text-xs text-gray-400 mt-1">{t('common.analytics')}</p>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {gradesCount === 0 && (
        <motion.div variants={fadeUp}><EmptyState icon={FileText} title={t('common.noData')} description={t('common.noData')} /></motion.div>
      )}
    </motion.div>
  );
}
