"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import {
  Award, Calendar, TrendingUp, FileSpreadsheet, CheckCircle, XCircle, Clock,
  ArrowRight, School, Paperclip, Megaphone, File, Youtube, Link as LinkIcon,
  ExternalLink, Bell, BookOpen, AlertCircle, User, Sparkles, Stars, Zap,
  BarChart3, GraduationCap,
} from "lucide-react";
import { GlassCard, GradientIcon, PremiumStatCard, GlowBadge, ViewSectionHeader, MiniSparkline } from "./ViewerDesignSystem";

interface Grade { id: string; subject: string; score: number; grade: string; class?: { name: string }; student?: { name: string }; createdAt: string | Date; }
interface Attendance { id: string; status: string; date: string | Date; class?: { name: string }; student?: { name: string }; }
interface ResourceItem { id: string; title: string; type: string; url: string; description: string | null; teacher: { name: string } | null; class: { name: string } | null; createdAt: string | Date; }
interface AnnouncementItem { id: string; title: string; content: string; type: string; teacher: { name: string } | null; class: { name: string } | null; createdAt: string | Date; }
interface NoteItem { id: string; content: string; type: string; teacher: { name: string } | null; student: { name: string } | null; class: { name: string } | null; createdAt: string | Date; }

interface Props {
  user: { id: string; name: string; email: string; role: string };
  grades: Grade[]; attendance: Attendance[]; avgScore: string | null;
  attendanceRate: string | null; presentCount: number; totalAttendance: number;
  uniqueClasses: number; profile?: { grade: string; guardian: string; phone: string; address: string } | null;
  recentResources: ResourceItem[]; recentAnnouncements: AnnouncementItem[]; recentNotes: NoteItem[];
}

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

const annStyles: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; color: string }> = {
  exam: { icon: GraduationCap, gradient: "from-red-500 to-rose-600", color: "text-red-600" },
  homework: { icon: BookOpen, gradient: "from-blue-500 to-indigo-600", color: "text-blue-600" },
  update: { icon: Bell, gradient: "from-emerald-500 to-teal-600", color: "text-emerald-600" },
  reminder: { icon: Calendar, gradient: "from-amber-500 to-orange-600", color: "text-amber-600" },
};

const resIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: File, youtube: Youtube, link: LinkIcon,
};

export default function ViewerDashboardClient({
  user, grades, attendance, avgScore, attendanceRate, presentCount, totalAttendance,
  uniqueClasses, recentResources, recentAnnouncements, recentNotes,
}: Props) {
  const { t } = useI18n();
  const isParent = user.role === "parent";
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const recentGrades = grades.slice(0, 5);
  const initials = user.name.split(" ").map((n) => n[0]).join("");

  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* ═══ PREMIUM HEADER ═══ */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 lg:p-10 shadow-2xl shadow-blue-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-purple-400/10 blur-xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-bold text-white shadow-lg ring-1 ring-white/30">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {`${t('common.welcomeBack')}, ${user.name.split(" ")[0]}`}
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </div>
              <p className="text-blue-100/80 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-5 py-2.5 text-sm text-white border border-white/10 shadow-lg">
              <School className="h-4 w-4" />
              <span className="font-medium">{t('common.schoolName')}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm text-white border border-white/10">
              <Stars className="h-4 w-4 text-yellow-300" />
              <span className="font-medium">{uniqueClasses} {isParent ? t('nav.subjects') : t('nav.classes')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ PREMIUM STAT CARDS ═══ */}
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumStatCard title={t('student.averageScore')} value={avgScore ? `${avgScore}/20` : "—"} subtitle={avgScore ? "Current average" : t('common.noData')}
          icon={Award} color="blue" trend={avgScore && parseFloat(avgScore) >= 12 ? "up" : "neutral"} trendValue={avgScore ? t('common.active') : ""}
          chart={<MiniSparkline data={[40, 50, 55, 60, 70, avgScore ? parseFloat(avgScore) * 5 : 65]} color="#3b82f6" />}
        />
        <PremiumStatCard title={t('student.attendanceRate')} value={attendanceRate ? `${attendanceRate}%` : "—"} subtitle={`${presentCount}/${totalAttendance} ${t('common.present').toLowerCase()}`}
          icon={Calendar} color="emerald" trend={attendanceRate && parseFloat(attendanceRate) >= 80 ? "up" : "neutral"} trendValue={attendanceRate ? t('student.attendanceRate') : ""}
          chart={<MiniSparkline data={totalAttendance > 0 ? [60, 70, 75, 80, 85, attendanceRate ? parseFloat(attendanceRate) : 75] : [0, 0, 0, 0, 0, 0]} color="#10b981" />}
        />
        <PremiumStatCard title={t('nav.subjects')} value={String(uniqueClasses)} subtitle={t('common.thisSemester')}
          icon={BookOpen} color="purple" trend="neutral" trendValue={t('common.active')}
          chart={<MiniSparkline data={[2, 3, 4, uniqueClasses, uniqueClasses, uniqueClasses]} color="#8b5cf6" />}
        />
        <PremiumStatCard title={t('student.myGrades')} value={String(grades.length)} subtitle={t('common.total')}
          icon={FileSpreadsheet} color="amber" trend={grades.length > 0 ? "up" : "neutral"} trendValue={String(grades.length)}
          chart={<MiniSparkline data={[0, 1, 3, 5, 8, grades.length]} color="#f59e0b" />}
        />
      </motion.div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Grades */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <ViewSectionHeader title={t('student.myGrades')} subtitle="Latest academic performance"
            action={<Link href={`/${user.role}/grades`} className="group flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"><span>{t('common.viewAll')}</span> <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></Link>}
          />
          <GlassCard className="p-6 lg:p-8">
            {recentGrades.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-500">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium text-gray-600">{t('common.noGrades')}</p>
                <p className="text-xs text-gray-400 mt-1">Your grades will appear here once teachers record them.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentGrades.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="group flex items-center justify-between rounded-2xl p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{g.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isParent && g.student?.name ? `${g.student.name} · ` : ""}{g.class?.name || ""}{g.class?.name ? " · " : ""}{new Date(String(g.createdAt)).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="w-24 sm:w-32">
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(g.score / 20) * 100}%` }} transition={{ duration: 1, delay: i * 0.06 }}
                            className={`h-full rounded-full ${g.score >= 16 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : g.score >= 12 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-red-400 to-red-500"}`}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-14 text-right tabular-nums">{g.score}/20</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border shadow-sm ${perfBadge(g.score).bg}`}>{perfBadge(g.score).label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={fadeUp} className="space-y-6">
          {/* Attendance Summary */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <GradientIcon icon={Calendar} color="emerald" size="sm" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('student.attendanceSummary')}</h3>
                <p className="text-xs text-gray-500">{attendanceRate ? `${attendanceRate}% rate` : t('common.noAttendance')}</p>
              </div>
            </div>
            {totalAttendance === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">{t('common.noAttendance')}</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: t('common.present'), count: presentCount, icon: CheckCircle, color: "emerald", bg: "bg-emerald-50/80 border-emerald-200/50", text: "text-emerald-700" },
                  { label: t('common.absent'), count: absentCount, icon: XCircle, color: "red", bg: "bg-red-50/80 border-red-200/50", text: "text-red-700" },
                  { label: t('common.late'), count: lateCount, icon: Clock, color: "amber", bg: "bg-amber-50/80 border-amber-200/50", text: "text-amber-700" },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between rounded-2xl ${item.bg} border px-4 py-3 backdrop-blur-sm transition-all hover:shadow-md`}>
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${item.text}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.text}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick Links */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">{t('common.quickLinks')}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: t('nav.grades'), href: `/${user.role}/grades`, gradient: "from-blue-500 to-cyan-500", icon: FileSpreadsheet },
                { label: t('nav.attendance'), href: `/${user.role}/attendance`, gradient: "from-emerald-500 to-teal-500", icon: Calendar },
                { label: t('nav.resources'), href: `/${user.role}/resources`, gradient: "from-purple-500 to-pink-500", icon: Paperclip },
                { label: t('nav.classes'), href: `/${user.role}/classes`, gradient: "from-amber-500 to-orange-500", icon: BookOpen },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className={`flex items-center gap-2.5 rounded-2xl bg-gradient-to-br ${item.gradient} px-4 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.97]`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ═══ ANNOUNCEMENTS ═══ */}
      {recentAnnouncements.length > 0 && (
        <motion.div variants={fadeUp}>
          <ViewSectionHeader title={t('student.recentAnnouncements')} subtitle="Stay informed with school updates" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAnnouncements.slice(0, 3).map((a) => {
              const style = annStyles[a.type] || annStyles.update;
              const Icon = style.icon;
              return (
                <GlassCard key={a.id} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{t(`teacher.${a.type}Announcement`)}</span>
                      <p className="text-xs text-gray-400">{[a.teacher?.name, a.class?.name, new Date(String(a.createdAt)).toLocaleDateString()].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{a.content}</p>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ RESOURCES & NOTES ═══ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources */}
        {recentResources.length > 0 && (
          <motion.div variants={fadeUp}>
            <ViewSectionHeader title={t('student.recentResources')} subtitle="Shared by teachers" />
            <div className="space-y-3">
              {recentResources.slice(0, 4).map((res) => {
                const Icon = resIcons[res.type] || LinkIcon;
                return (
                  <GlassCard key={res.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 shadow-sm border border-gray-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{res.title}</p>
                      <p className="text-xs text-gray-500">{res.teacher?.name || t('roles.teacher')}{res.class?.name ? ` · ${res.class.name}` : ""} · {new Date(String(res.createdAt)).toLocaleDateString()}</p>
                    </div>
                    <a href={res.url} target="_blank" rel="noopener noreferrer"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Teacher Notes */}
        {recentNotes.length > 0 && (
          <motion.div variants={fadeUp}>
            <ViewSectionHeader title={t('student.recentNotes')} subtitle="Recent class & student notes" />
            <div className="space-y-3">
              {recentNotes.slice(0, 4).map((n) => {
                const Icon = n.type === "class" ? BookOpen : n.type === "behavior" ? AlertCircle : User;
                const colors: Record<string, string> = {
                  class: "from-blue-100 to-cyan-100 text-blue-600 border-blue-200/50",
                  student: "from-purple-100 to-pink-100 text-purple-600 border-purple-200/50",
                  behavior: "from-amber-100 to-orange-100 text-amber-600 border-amber-200/50",
                };
                return (
                  <GlassCard key={n.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[n.type] || colors.class} border shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold uppercase text-gray-500">{n.type} {t('common.notes').toLowerCase()}</span>
                            {n.student && <span className="text-xs text-gray-400">· {n.student.name}</span>}
                            {n.class?.name && <span className="text-xs text-gray-400">· {n.class.name}</span>}
                            <span className="text-xs text-gray-400">· {new Date(String(n.createdAt)).toLocaleDateString()}</span>
                          </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{n.content}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.teacher?.name || t('roles.teacher')}</p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
