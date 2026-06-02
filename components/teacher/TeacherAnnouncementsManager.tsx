"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { Megaphone, Plus, Trash2, CheckCircle, AlertTriangle, GraduationCap, BookOpen, Calendar, Bell, X } from "lucide-react";
import Modal from "@/components/admin/Modal";

interface AnnouncementItem {
  id: string; title: string; content: string; type: string;
  teacher?: { name: string } | null; class?: { name: string } | null;
  createdAt: string | Date;
}
interface ClassItem { id: string; name: string }
interface Props { announcements: AnnouncementItem[]; classes: ClassItem[] }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; gradient: string; bg: string }> = {
  exam: { icon: GraduationCap, label: "Exam", gradient: "from-red-500 to-rose-600", bg: "bg-red-50" },
  homework: { icon: BookOpen, label: "Homework", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
  update: { icon: Bell, label: "Update", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
  reminder: { icon: Calendar, label: "Reminder", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50" },
};

export default function TeacherAnnouncementsManager({ announcements: initial, classes }: Props) {
  const { t } = useI18n();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initial);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  }, []);
  const [form, setForm] = useState({ title: "", content: "", type: "update", classId: "" });
  const [addOpen, setAddOpen] = useState(false);

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setAnnouncements((p) => [{ ...d.announcement, class: classes.find((c) => c.id === form.classId) || null }, ...p]);
      showToast("Announcement published");
      setAddOpen(false);
      setForm({ title: "", content: "", type: "update", classId: "" });
    } catch { showToast("Failed to create announcement", "error"); }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch("/api/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setAnnouncements((p) => p.filter((a) => a.id !== id));
      showToast("Announcement removed");
    } catch { showToast("Failed to delete", "error"); }
  };

  return (
    <motion.div className="space-y-6 pb-10" variants={container} initial="hidden" animate="visible">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-xl border ${
              toast.type === "success" ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/50" : "bg-red-50/90 text-red-800 border-red-200/50"
            }`}>
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('teacher.announcementsTitle')}</h1>
              <p className="text-pink-200 text-sm">{t('teacher.announcementsDesc')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/30 hover:bg-white/30 transition-all">
            <Plus className="h-4 w-4" /> {t('teacher.addAnnouncement')}
          </motion.button>
        </div>
      </motion.div>

      {announcements.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-400">
            <Megaphone className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-900">{t('common.noAnnouncements')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('teacher.announcementsDesc')}</p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {announcements.map((a, i) => {
            const cfg = typeConfig[a.type] || typeConfig.update;
            const Icon = cfg.icon;
            return (
              <motion.div key={a.id} variants={fadeUp} custom={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cfg.gradient}`} />
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg} shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r ${cfg.gradient} text-white`}>
                          {a.type === 'exam' ? t('teacher.examAnnouncement') : a.type === 'homework' ? t('teacher.homeworkAnnouncement') : a.type === 'reminder' ? t('teacher.reminderAnnouncement') : t('teacher.updateAnnouncement')}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(String(a.createdAt)).toLocaleDateString()}</span>
                        {a.class && <span className="text-xs text-gray-400">· {a.class.name}</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1.5">{a.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{a.content}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteAnnouncement(a.id)}
                    className="shrink-0 rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all ml-4">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('teacher.addAnnouncement')} size="md">
        <form onSubmit={addAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.announcementType')} <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {["exam", "homework", "update", "reminder"].map((type) => {
                const cfg = typeConfig[type] || typeConfig.update;
                const active = form.type === type;
                return (
                  <button key={type} type="button" onClick={() => setForm((p) => ({ ...p, type }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all ${
                      active ? "border-transparent text-white shadow-md" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    } ${active ? `bg-gradient-to-br ${cfg.gradient}` : ""}`}>
                    <cfg.icon className="h-4 w-4" />
                    {type === 'exam' ? t('teacher.examAnnouncement') : type === 'homework' ? t('teacher.homeworkAnnouncement') : type === 'reminder' ? t('teacher.reminderAnnouncement') : t('teacher.updateAnnouncement')}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.announcementTitle')} <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.announcementContent')} <span className="text-red-400">*</span></label>
            <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={3} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')}</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all">
              <option value="">{t('common.allClasses')}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-rose-500/25 hover:shadow-xl transition-all">{t('common.save')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
