"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap, Star, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import EmptyState from "@/components/admin/EmptyState";
import { GlassCard, GradientIcon, GlowBadge, ViewSectionHeader } from "./ViewerDesignSystem";

interface ClassItem { id: string; name: string; section: string; teacher?: { id: string; name: string; email: string } | null; }
interface Props { classes: ClassItem[]; role: string; }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const SUBJECT_KEYS = ["subjects.mathematics", "subjects.physics", "subjects.chemistry", "subjects.biology", "subjects.english", "subjects.french", "subjects.history", "subjects.geography", "subjects.computerScience"];
const classGradients = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-rose-500 to-pink-600", "from-indigo-500 to-purple-600"];

export default function ViewerClassesClient({ classes, role }: Props) {
  const { t } = useI18n();
  const subjects = SUBJECT_KEYS.map((k) => t(k));
  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Premium Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 p-6 lg:p-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-violet-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-indigo-200/80 text-sm font-medium">{t('student.classesTitle')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.myClasses')}</h1>
          <p className="text-indigo-100/80 text-sm mt-1">{classes.length} {classes.length !== 1 ? t('common.class_other') : t('common.class_one')} {t('common.assigned')}</p>
        </div>
      </motion.div>

      {classes.length === 0 ? (
        <motion.div variants={fadeUp}><EmptyState icon={BookOpen} title={t('common.noClasses')} description={t('common.noClasses')} /></motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((cls, i) => (
            <GlassCard key={cls.id} className="p-6">
              <div className={`absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r ${classGradients[i % classGradients.length]}`} />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${classGradients[i % classGradients.length]} text-white shadow-lg`}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-500">{cls.section || t('common.overview')}</p>
                  </div>
                </div>
                <GlowBadge color="emerald">{t('common.active')}</GlowBadge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {subjects.length} {t('nav.subjects')}</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {cls.teacher?.name || t('common.unassigned')}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">{t('nav.subjects')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.slice(0, 5).map((s) => (
                    <span key={s} className="inline-flex items-center rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200/50 shadow-sm">
                      {s}
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200/50 shadow-sm">
                    +{subjects.length - 5} {t('common.records').toLowerCase()}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
