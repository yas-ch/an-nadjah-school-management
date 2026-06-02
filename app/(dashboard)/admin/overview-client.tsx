"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, GraduationCap, BookOpen, TrendingUp, ArrowRight,
  UserPlus, ClipboardList, Calendar, Activity, PieChart, BarChart3,
  CheckCircle, XCircle, Clock, FileSpreadsheet, Award, BookMarked,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useI18n } from "@/lib/i18n-context";

interface RecentStudent { id: string; name: string; email: string; createdAt: string; }
interface RecentGrade { id: string; studentName: string; subject: string; className: string; score: number; grade: string; }

interface AdminOverviewClientProps {
  user: { name: string };
  stats: { studentCount: number; teacherCount: number; classCount: number; gradeCount: number; attendanceRate: string; totalAttendance: number; };
  recentStudents: RecentStudent[];
  recentGrades: RecentGrade[];
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function SparklineChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const w = 120; const h = 36;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
    </svg>
  );
}

const quickActions = (tr: (key: string) => string) => [
  { label: tr('admin.addStudentCta'), href: "/admin/students", icon: UserPlus, desc: tr('admin.addStudentCta'), color: "blue" },
  { label: tr('admin.addTeacherCta'), href: "/admin/teachers", icon: GraduationCap, desc: tr('admin.addTeacherCta'), color: "green" },
  { label: tr('admin.addClassCta'), href: "/admin/classes", icon: BookOpen, desc: tr('admin.addClassCta'), color: "purple" },
  { label: tr('admin.markAttendance'), href: "/admin/attendance", icon: Calendar, desc: tr('admin.markAttendance'), color: "orange" },
  { label: tr('admin.recordGrades'), href: "/admin/grades", icon: FileSpreadsheet, desc: tr('admin.recordGrades'), color: "indigo" },
  { label: tr('admin.manageSubjects'), href: "/admin/subjects", icon: BookMarked, desc: tr('admin.manageSubjects'), color: "rose" },
];

export default function AdminOverviewClient({ user, stats, recentStudents, recentGrades }: AdminOverviewClientProps) {
  const { t: tr } = useI18n();
  const avgScore = stats.gradeCount > 0 && recentGrades.length > 0
    ? (recentGrades.reduce((s, g) => s + g.score, 0) / recentGrades.length).toFixed(1) : null;

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.dashboardTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{tr('common.welcomeBack')}, {user.name}. {tr('admin.dashboardDesc')}</p>
        </div>
        <Link href="/admin/students"
          className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          {tr('admin.addStudentCta')}
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr('admin.totalStudents')} value={stats.studentCount.toString()} change={tr('common.enrolled')} icon={Users} color="blue" trend="up" trendValue="+12%" />
        <StatCard title={tr('admin.totalTeachers')} value={stats.teacherCount.toString()} change={tr('common.active')} icon={GraduationCap} color="green" trend="up" trendValue="+2" />
        <StatCard title={tr('admin.totalClasses')} value={stats.classCount.toString()} change={tr('common.thisSemester')} icon={BookOpen} color="purple" trend="neutral" trendValue={tr('common.active')} />
        <StatCard title={tr('admin.attendanceRate')} value={`${stats.attendanceRate}%`} change={stats.totalAttendance > 0 ? `Out of ${stats.totalAttendance} ${tr('common.records')}` : "No data"}
          icon={TrendingUp} color="orange" trend={parseFloat(stats.attendanceRate) >= 80 ? "up" : parseFloat(stats.attendanceRate) >= 60 ? "neutral" : "down"}
          trendValue={`${stats.attendanceRate}%`} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.studentGrowth')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.studentGrowthDesc')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Activity className="h-5 w-5" /></div>
          </div>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.studentCount}</p>
              <p className="text-sm text-emerald-600 font-medium">{tr('admin.studentGrowthDesc')}</p>
            </div>
            <SparklineChart data={[stats.studentCount * 0.6, stats.studentCount * 0.7, stats.studentCount * 0.75, stats.studentCount * 0.85, stats.studentCount * 0.9, stats.studentCount]} color="#3b82f6" />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400"><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span></div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.attendanceOverview')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.attendanceOverviewDesc')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><PieChart className="h-5 w-5" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: tr('common.present'), value: "75%", color: "bg-emerald-500", icon: CheckCircle, textColor: "text-emerald-600", bgColor: "bg-emerald-50" },
              { label: tr('common.absent'), value: "15%", color: "bg-amber-500", icon: XCircle, textColor: "text-amber-600", bgColor: "bg-amber-50" },
              { label: tr('common.late'), value: "10%", color: "bg-violet-500", icon: Clock, textColor: "text-violet-600", bgColor: "bg-violet-50" },
            ].map((item) => (
              <div key={item.label} className={`flex flex-col items-center gap-2 rounded-xl ${item.bgColor} p-4`}>
                <item.icon className={`h-6 w-6 ${item.textColor}`} />
                <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                <span className={`text-lg font-bold ${item.textColor}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{tr('admin.recentStudents')}</h2>
            <Link href="/admin/students" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              {tr('common.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">{tr('common.noStudents')}</div>
          ) : (
            <div className="space-y-2">
              {recentStudents.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-md">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{tr('common.active')}</span>
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{tr('admin.recentGrades')}</h2>
            <Link href="/admin/grades" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              {tr('common.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentGrades.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">{tr('common.noGrades')}</div>
          ) : (
            <div className="space-y-2">
              {recentGrades.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{g.studentName}</p>
                      <p className="text-xs text-gray-500">{g.subject} &middot; {g.className}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${g.score >= 90 ? "text-emerald-600" : g.score >= 80 ? "text-blue-600" : g.score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {g.grade}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tr('admin.quickActions')}</h2>
            <p className="text-sm text-gray-500">{tr('admin.quickActionsDesc')}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><BarChart3 className="h-5 w-5" /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions(tr).map((action, i) => {
            const Icon = action.icon;
            const colorClasses: Record<string, string> = {
              blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
              green: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
              purple: "from-violet-500 to-violet-600 shadow-violet-500/20",
              orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
              indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20",
              rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
            };
            return (
              <motion.div key={action.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={action.href}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-5 text-center hover:border-gray-200 hover:shadow-md transition-all"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110 ${colorClasses[action.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
