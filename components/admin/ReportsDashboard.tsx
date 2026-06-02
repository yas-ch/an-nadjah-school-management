"use client";

import { motion } from "framer-motion";
import {
  Users, GraduationCap, BookOpen, BarChart3, TrendingUp, Award,
  Calendar, CheckCircle, XCircle, Clock, FileSpreadsheet, PieChart,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

interface ReportsDashboardProps {
  students: { id: string; name: string; email: string; grade: string; createdAt: string }[];
  teachers: { id: string; name: string; email: string; department: string; classCount: number; gradeCount: number }[];
  classes: { id: string; name: string; teacher: string; gradeCount: number; attendanceCount: number }[];
  grades: { id: string; studentName: string; subject: string; className: string; score: number; grade: string }[];
  attendance: { id: string; status: string; date: string }[];
}

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ReportsDashboard({ students, teachers, classes, grades, attendance }: ReportsDashboardProps) {
  const { t: tr } = useI18n();
  const avgScore = grades.length > 0 ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : "0";
  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : "0";

  const gradeDist = grades.reduce<Record<string, number>>((acc, g) => {
    const letter = g.grade.charAt(0);
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});

  const topStudents = [...grades].sort((a, b) => b.score - a.score).slice(0, 5);
  const avgScoreBySubject = grades.reduce<Record<string, { sum: number; count: number }>>((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = { sum: 0, count: 0 };
    acc[g.subject].sum += g.score;
    acc[g.subject].count += 1;
    return acc;
  }, {});

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.reportsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{tr('admin.reportsDesc')}</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: tr('admin.totalStudents'), value: students.length, icon: Users, color: "from-blue-500 to-blue-600", detail: tr('common.enrolled') },
          { label: tr('admin.totalTeachers'), value: teachers.length, icon: GraduationCap, color: "from-emerald-500 to-emerald-600", detail: tr('common.onStaff') },
          { label: tr('admin.totalClasses'), value: classes.length, icon: BookOpen, color: "from-violet-500 to-violet-600", detail: tr('common.thisSemester') },
          { label: tr('admin.attendanceRate'), value: `${attendanceRate}%`, icon: TrendingUp, color: "from-orange-500 to-orange-600", detail: `${attendance.length} ${tr('common.records')}` },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.detail}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.gradeDistribution')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.gradeDistDesc')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><PieChart className="h-5 w-5" /></div>
          </div>
          <div className="space-y-3">
            {["A", "B", "C", "D", "F"].map(letter => {
              const count = gradeDist[letter] || 0;
              const pct = grades.length > 0 ? (count / grades.length) * 100 : 0;
              const colorMap: Record<string, string> = { A: "bg-emerald-500", B: "bg-blue-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500" };
              return (
                <div key={letter} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-gray-700">{letter}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${colorMap[letter]}`} transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm text-gray-500">{count} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.attendanceOverviewTitle')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.attendanceOverviewSub')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Calendar className="h-5 w-5" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: tr('common.present'), count: presentCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", pct: attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0 },
              { label: tr('common.absent'), count: absentCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50", pct: attendance.length > 0 ? (absentCount / attendance.length) * 100 : 0 },
              { label: tr('common.late'), count: lateCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", pct: attendance.length > 0 ? (lateCount / attendance.length) * 100 : 0 },
            ].map(item => (
              <div key={item.label} className={`flex flex-col items-center gap-2 rounded-xl ${item.bg} p-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.pct.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.topStudents')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.topStudentsDesc')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Award className="h-5 w-5" /></div>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{tr('common.noGrades')}</p>
          ) : (
            <div className="space-y-2">
              {topStudents.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{g.studentName}</p>
                      <p className="text-xs text-gray-500">{g.subject} &middot; {g.className}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{g.score}%</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.avgScoreBySubject')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.avgScoreBySubjectDesc')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BarChart3 className="h-5 w-5" /></div>
          </div>
          {Object.keys(avgScoreBySubject).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{tr('common.noGrades')}</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(avgScoreBySubject).map(([subject, data], i) => {
                const avg = (data.sum / data.count).toFixed(1);
                const pct = parseFloat(avg);
                return (
                  <motion.div key={subject} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                      <span className={`text-sm font-semibold ${pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>{avg}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tr('admin.academicSummary')}</h2>
            <p className="text-sm text-gray-500">{tr('admin.academicSummaryDesc')}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><FileSpreadsheet className="h-5 w-5" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: tr('admin.averageScore'), value: `${avgScore}%`, icon: Award, color: "from-blue-500 to-blue-600" },
            { label: tr('admin.totalGrades'), value: grades.length, icon: FileSpreadsheet, color: "from-purple-500 to-purple-600" },
            { label: tr('admin.attendanceRate'), value: `${attendanceRate}%`, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
            { label: tr('admin.totalRecords'), value: attendance.length, icon: Calendar, color: "from-amber-500 to-amber-600" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
