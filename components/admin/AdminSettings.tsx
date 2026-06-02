"use client";

import { motion } from "framer-motion";
import {
  Settings, Shield, Bell, Globe, Palette, Users, GraduationCap,
  BookOpen, BookMarked, FileSpreadsheet, Calendar,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

interface AdminSettingsProps {
  user: { name: string; email: string };
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    totalGrades: number;
    totalAttendance: number;
  };
}

export default function AdminSettings({ user, stats }: AdminSettingsProps) {
  const { t: tr } = useI18n();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.settingsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{tr('admin.settingsDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: tr('admin.totalStudents'), value: stats.totalStudents, icon: Users, color: "from-blue-500 to-blue-600" },
          { label: tr('admin.totalTeachers'), value: stats.totalTeachers, icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
          { label: tr('admin.totalClasses'), value: stats.totalClasses, icon: BookOpen, color: "from-violet-500 to-violet-600" },
          { label: tr('admin.subjectsTitle'), value: stats.totalSubjects, icon: BookMarked, color: "from-purple-500 to-purple-600" },
          { label: tr('admin.totalGrades'), value: stats.totalGrades, icon: FileSpreadsheet, color: "from-amber-500 to-amber-600" },
          { label: tr('admin.attendanceRecords'), value: stats.totalAttendance, icon: Calendar, color: "from-rose-500 to-rose-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('admin.systemInfo')}</h2>
              <p className="text-sm text-gray-500">{tr('admin.systemInfoDesc')}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: tr('admin.administrator'), value: user.name },
              { label: tr('common.email'), value: user.email },
              { label: tr('common.platform'), value: "AN-NADJAH School Management" },
              { label: tr('common.version'), value: "1.0.0" },
              { label: tr('common.database'), value: "PostgreSQL (Neon)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tr('common.quickLinks')}</h2>
              <p className="text-sm text-gray-500">Navigate to management sections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: tr('admin.manageTeachers'), href: "/admin/teachers", color: "from-emerald-500 to-emerald-600", icon: GraduationCap },
              { label: tr('admin.manageStudents'), href: "/admin/students", color: "from-blue-500 to-blue-600", icon: Users },
              { label: tr('admin.manageClasses'), href: "/admin/classes", color: "from-violet-500 to-violet-600", icon: BookOpen },
              { label: tr('admin.manageSubjects'), href: "/admin/subjects", color: "from-purple-500 to-purple-600", icon: BookMarked },
            ].map((link) => (
              <a key={link.label} href={link.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all group"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tr('admin.schoolConfig')}</h2>
            <p className="text-sm text-gray-500">{tr('admin.schoolConfigDesc')}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: tr('common.schoolName'), value: "AN-NADJAH" },
            { label: tr('common.academicYear'), value: "2025-2026" },
            { label: tr('common.semester'), value: "Spring 2026" },
            { label: tr('admin.timezone'), value: "UTC" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
