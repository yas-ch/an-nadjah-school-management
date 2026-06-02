"use client";

import { motion } from "framer-motion";
import { Award, TrendingUp, FileSpreadsheet, BookOpen, ArrowDown, Star, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import { GlassCard, PremiumStatCard, GradientIcon, GlowBadge, ViewSectionHeader, ProgressCircle } from "./ViewerDesignSystem";

interface GradeItem { id: string; subject: string; score: number; grade: string; class?: { name: string }; student?: { name: string }; createdAt: string | Date; }
interface Props { grades: GradeItem[]; role: string; }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const gradeColor = (g: string) =>
  g.startsWith("A") ? "bg-emerald-100 text-emerald-700 border-emerald-200/50" : g.startsWith("B") ? "bg-blue-100 text-blue-700 border-blue-200/50"
  : g.startsWith("C") ? "bg-amber-100 text-amber-700 border-amber-200/50" : g.startsWith("D") ? "bg-orange-100 text-orange-700 border-orange-200/50"
  : "bg-red-100 text-red-700 border-red-200/50";

const perfBadge = (score: number) => {
  if (score >= 16) return { label: "Excellent", bg: "bg-emerald-100 text-emerald-700 border-emerald-200/50" };
  if (score >= 14) return { label: "Very Good", bg: "bg-blue-100 text-blue-700 border-blue-200/50" };
  if (score >= 12) return { label: "Good", bg: "bg-amber-100 text-amber-700 border-amber-200/50" };
  if (score >= 10) return { label: "Average", bg: "bg-orange-100 text-orange-700 border-orange-200/50" };
  return { label: "Needs Improvement", bg: "bg-red-100 text-red-700 border-red-200/50" };
};

const gradeBarGradient = (score: number) =>
  score >= 16 ? "from-emerald-400 to-emerald-500" : score >= 14 ? "from-blue-400 to-blue-500" : score >= 12 ? "from-amber-400 to-amber-500"
  : score >= 10 ? "from-orange-400 to-orange-500" : "from-red-400 to-red-500";

const gradeCircleColor = (score: number) =>
  score >= 16 ? "#10b981" : score >= 14 ? "#3b82f6" : score >= 12 ? "#f59e0b" : score >= 10 ? "#f97316" : "#ef4444";

export default function ViewerGradesClient({ grades, role }: Props) {
  const { t } = useI18n();
  const avgScore = grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : null;
  const maxScore = grades.length > 0 ? Math.max(...grades.map((g) => g.score)) : null;
  const minScore = grades.length > 0 ? Math.min(...grades.map((g) => g.score)) : null;
  const passCount = grades.filter((g) => g.score >= 10).length;
  const passRate = grades.length > 0 ? ((passCount / grades.length) * 100).toFixed(0) : null;

  const uniqueSubjects = Array.from(new Set(grades.map((g) => g.subject)));
  const subjectAverages = uniqueSubjects.map((subj) => {
    const sg = grades.filter((g) => g.subject === subj);
    const avg = sg.reduce((s, g) => s + g.score, 0) / sg.length;
    const lat = [...sg].sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())[0];
    return { subject: subj, avg, latest: lat };
  });

  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-800 p-6 lg:p-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-pink-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-purple-200/80 text-sm font-medium">{t('student.subjectPerformance')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.gradesTitle')}</h1>
          <p className="text-purple-100/80 text-sm mt-1">{grades.length} {grades.length !== 1 ? t('common.grade_other') : t('common.grade_one')} {t('common.records').toLowerCase()} · Scored out of 20</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumStatCard title={t('student.averageScore')} value={avgScore ? `${avgScore}/20` : "—"} subtitle={`${t('common.pass').toLowerCase()} rate: ${passRate || 0}%`} icon={Award} color="purple" trend={avgScore && parseFloat(avgScore) >= 12 ? "up" : "neutral"} trendValue={avgScore ? t('common.overview') : ""} />
        <PremiumStatCard title="Highest Score" value={maxScore ? `${maxScore}/20` : "—"} subtitle={t('student.performanceSummary')} icon={TrendingUp} color="emerald" trend="up" trendValue="Max" />
        <PremiumStatCard title="Lowest Score" value={minScore ? `${minScore}/20` : "—"} subtitle={t('student.performanceSummary')} icon={ArrowDown} color={minScore && minScore >= 10 ? "emerald" : "amber"} trend={minScore && minScore >= 10 ? "up" : "down"} trendValue="Min" />
        <PremiumStatCard title="Pass Rate (≥10/20)" value={passRate ? `${passRate}%` : "—"} subtitle={`${passCount}/${grades.length} ${t('common.active').toLowerCase()}`} icon={BookOpen} color="rose" trend={passRate && parseFloat(passRate) >= 70 ? "up" : "neutral"} trendValue="Passing" />
      </motion.div>

      {/* Subject Performance */}
      {subjectAverages.length > 0 && (
        <motion.div variants={fadeUp}>
          <ViewSectionHeader title={t('student.subjectPerformance')} subtitle="Per-subject breakdown (out of 20)" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subjectAverages.map((sa, i) => (
              <GlassCard key={sa.subject} className="p-5 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{sa.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{grades.filter((g) => g.subject === sa.subject).length} {t('common.grade_other')}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border shadow-sm ${gradeColor(sa.latest.grade)}`}>{sa.latest.grade}</span>
                </div>
                <div className="flex items-end justify-between">
                  <ProgressCircle value={sa.avg * 5} size={64} strokeWidth={6} color={gradeCircleColor(sa.avg)} label={t('student.averageScore')} />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Subject Avg</p>
                    <p className="text-lg font-bold text-gray-900">{sa.avg.toFixed(1)}/20</p>
                    <p className="text-[10px] text-gray-400">{new Date(String(sa.latest.createdAt)).toLocaleDateString()}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Grades Table */}
      <motion.div variants={fadeUp}>
        <ViewSectionHeader title={t('student.gradesTitle')} subtitle={t('student.gradeSummary')} />
        {grades.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title={t('common.noGrades')} description={t('common.noGrades')} />
        ) : (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                    {[t('admin.subject'), ...(role === "parent" ? ["Student"] : []), t('admin.className'), "Score (/20)", "Perf.", t('admin.gradesTitle'), t('common.date')].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grades.map((g, i) => (
                    <motion.tr key={g.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200"
                    >
                      <td className="px-5 py-4"><span className="font-semibold text-gray-900">{g.subject}</span></td>
                      {role === "parent" && <td className="px-5 py-4"><span className="font-semibold text-gray-700">{g.student?.name || ""}</span></td>}
                      <td className="px-5 py-4 text-gray-600">{(g as any).class?.name || ""}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20">
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${gradeBarGradient(g.score)}`} style={{ width: `${(g.score / 20) * 100}%` }} />
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 text-sm tabular-nums">{g.score}/20</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border shadow-sm ${perfBadge(g.score).bg}`}>{perfBadge(g.score).label}</span>
                      </td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border shadow-sm ${gradeColor(g.grade)}`}>{g.grade}</span></td>
                      <td className="px-5 py-4 text-gray-500">{new Date(String(g.createdAt)).toLocaleDateString()}</td>
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