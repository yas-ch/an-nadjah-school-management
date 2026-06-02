"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Shield, School, Sparkles, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { GlassCard, GradientIcon, GlowBadge, ViewSectionHeader } from "./ViewerDesignSystem";

interface Props {
  user: { id: string; name: string; email: string; role: string };
  profile?: { grade: string; guardian: string; phone: string; address: string; enrolledAt: string | Date } | null;
  gradesCount: number; attendanceRate: string | null; avgScore: string | null;
}

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function ViewerProfileClient({ user, profile, gradesCount, attendanceRate, avgScore }: Props) {
  const { t } = useI18n();
  const initials = user.name.split(" ").map((n) => n[0]).join("");

  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Premium Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-6 lg:p-8 shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-indigo-200/80 text-sm font-medium">{t('student.myProfile')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.profileTitle')}</h1>
          <p className="text-indigo-100/80 text-sm mt-1">{t('student.contactInfo')} {t('common.analytics')}</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Card */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlassCard className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-3xl font-bold text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-400 border-2 border-white shadow-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <GlowBadge color="blue">{user.role === "student" ? t('roles.student') : t('roles.parent')}</GlowBadge>
                  <GlowBadge color="emerald">{t('common.active')}</GlowBadge>
                  <GlowBadge color="purple">{t('common.schoolName')}</GlowBadge>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('student.contactInfo')}</h3>
                <div className="space-y-3">
                  {[
                    { icon: Mail, bg: "from-blue-50 to-cyan-50", color: "text-blue-600", label: t('common.email'), value: user.email },
                    ...(profile?.phone ? [{ icon: Phone, bg: "from-emerald-50 to-teal-50", color: "text-emerald-600", label: t('common.phone'), value: profile.phone }] : []),
                    ...(profile?.address ? [{ icon: MapPin, bg: "from-amber-50 to-orange-50", color: "text-amber-600", label: t('common.address'), value: profile.address }] : []),
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white border border-gray-100/50">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.bg} ${item.color} shadow-sm`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('student.academicInfo')}</h3>
                <div className="space-y-3">
                  {profile?.grade && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50/50 to-white border border-gray-100/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 shadow-sm">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('common.grade_one')}</p>
                        <p className="text-sm font-semibold text-gray-900">{profile.grade}</p>
                      </div>
                    </div>
                  )}
                  {profile?.guardian && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-white border border-gray-100/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('admin.guardian')}</p>
                        <p className="text-sm font-semibold text-gray-900">{profile.guardian}</p>
                      </div>
                    </div>
                  )}
                  {profile?.enrolledAt && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-rose-50/50 to-white border border-gray-100/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 shadow-sm">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('common.enrolled')}</p>
                        <p className="text-sm font-semibold text-gray-900">{new Date(String(profile.enrolledAt)).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div variants={fadeUp} className="space-y-5">
          <GlassCard className="p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            <h3 className="text-sm font-bold text-gray-900 mb-5">{t('student.quickStats')}</h3>
            <div className="space-y-4">
              {[
                { icon: BookOpen, color: "text-blue-600", bg: "from-blue-50 to-cyan-50", label: t('student.myGrades'), value: String(gradesCount) },
                { icon: Award, color: "text-emerald-600", bg: "from-emerald-50 to-teal-50", label: t('student.averageScore'), value: `${avgScore ?? "—"}%` },
                { icon: Calendar, color: "text-amber-600", bg: "from-amber-50 to-orange-50", label: t('student.attendanceRate'), value: `${attendanceRate ?? "—"}%` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-white/80 border border-gray-100/50 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.bg} ${item.color} shadow-sm`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <School className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('common.schoolName')}</h3>
                <p className="text-xs text-gray-500">{t('common.platform')}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{t('student.schoolBranding')}</p>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
