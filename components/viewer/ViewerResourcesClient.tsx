"use client";

import { motion } from "framer-motion";
import { File, Youtube, Link as LinkIcon, ExternalLink, Download, Paperclip, Star, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import EmptyState from "@/components/admin/EmptyState";
import { GlassCard, GradientIcon, GlowBadge, ViewSectionHeader } from "./ViewerDesignSystem";

interface ResourceItem { id: string; title: string; type: string; url: string; description: string | null; teacher: { name: string } | null; class: { name: string } | null; createdAt: string | Date; }
interface Props { resources: ResourceItem[]; role: string; }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const RESOURCE_LABEL_KEYS: Record<string, string> = {
  pdf: "teacher.resourcePdf",
  youtube: "teacher.resourceYoutube",
  link: "teacher.resourceLink",
};

export default function ViewerResourcesClient({ resources, role }: Props) {
  const { t } = useI18n();
  const resConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; color: string; bg: string; label: string }> = {
    pdf: { icon: File, gradient: "from-rose-500 to-pink-600", color: "text-rose-600", bg: "bg-rose-50", label: t('teacher.resourcePdf') },
    youtube: { icon: Youtube, gradient: "from-red-500 to-rose-600", color: "text-red-600", bg: "bg-red-50", label: t('teacher.resourceYoutube') },
    link: { icon: LinkIcon, gradient: "from-blue-500 to-cyan-600", color: "text-blue-600", bg: "bg-blue-50", label: t('teacher.resourceLink') },
  };
  return (
    <motion.div className="space-y-8 pb-10" variants={container} initial="hidden" animate="visible">
      {/* Premium Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-6 lg:p-8 shadow-2xl shadow-orange-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-rose-400/10 blur-2xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="h-5 w-5 text-yellow-200" />
            <span className="text-amber-200/80 text-sm font-medium">{t('student.resourcesTitle')}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mt-1">{t('student.resourcesTitle')}</h1>
            <p className="text-amber-100/80 text-sm mt-1">{resources.length} {resources.length !== 1 ? t('common.record_other') : t('common.record_one')} shared by {t('roles.teacher_other')}</p>
        </div>
      </motion.div>

      {resources.length === 0 ? (
        <motion.div variants={fadeUp}><EmptyState icon={Paperclip} title={t('common.noResources')} description={t('common.noResources')} /></motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((res, i) => {
            const cfg = resConfig[res.type] || resConfig.link;
            const Icon = cfg.icon;
            return (
              <GlassCard key={res.id} className="p-5 lg:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <GlowBadge color={res.type === "pdf" ? "rose" : res.type === "youtube" ? "red" : "blue"}>{cfg.label}</GlowBadge>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{res.title}</h3>
                {res.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{res.description}</p>}
                <p className="text-xs text-gray-400 truncate mb-4">{res.url}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    <span>{res.teacher?.name || t('roles.teacher')}</span>
                    {res.class?.name && <span> · {res.class.name}</span>}
                    <span> · {new Date(String(res.createdAt)).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <a href={res.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-all">
                      <ExternalLink className="h-3.5 w-3.5" /> {t('teacher.openResource')}
                    </a>
                    {res.type === "pdf" && (
                      <a href={res.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
