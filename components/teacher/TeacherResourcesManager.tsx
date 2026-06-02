"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { Paperclip, Plus, Trash2, File, Youtube, Link as LinkIcon, CheckCircle, AlertTriangle, ExternalLink, Search, X } from "lucide-react";
import Modal from "@/components/admin/Modal";

interface ResourceItem { id: string; title: string; type: string; url: string; description: string | null; class: { id: string; name: string } | null; createdAt: string | Date; }
interface ClassItem { id: string; name: string }
interface Props { resources: ResourceItem[]; classes: ClassItem[] }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const resConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; bg: string }> = {
  pdf: { icon: File, gradient: "from-rose-400 to-pink-500", bg: "bg-rose-50" },
  youtube: { icon: Youtube, gradient: "from-red-400 to-rose-500", bg: "bg-red-50" },
  link: { icon: LinkIcon, gradient: "from-blue-400 to-cyan-500", bg: "bg-blue-50" },
};

export default function TeacherResourcesManager({ resources: initial, classes }: Props) {
  const { t } = useI18n();
  const [resources, setResources] = useState<ResourceItem[]>(initial);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  }, []);
  const [form, setForm] = useState({ title: "", type: "pdf", url: "", description: "", classId: "" });
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setResources((p) => [{ ...d.resource, class: classes.find((c) => c.id === form.classId) || null }, ...p]);
      showToast("Resource shared with students");
      setAddOpen(false);
      setForm({ title: "", type: "pdf", url: "", description: "", classId: "" });
    } catch { showToast("Failed to add resource", "error"); }
    finally { setLoading(false); }
  };

  const deleteResource = async (id: string) => {
    try {
      const res = await fetch("/api/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setResources((p) => p.filter((r) => r.id !== id));
      showToast("Resource removed");
    } catch { showToast("Failed to delete", "error"); }
  };

  const filtered = search
    ? resources.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
    : resources;

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
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <Paperclip className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('teacher.resourcesTitle')}</h1>
              <p className="text-orange-200 text-sm">{t('teacher.resourcesDesc')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/30 hover:bg-white/30 transition-all">
            <Plus className="h-4 w-4" /> {t('teacher.addResource')}
          </motion.button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 text-orange-400">
            <Paperclip className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-900">{search ? "No resources match your search" : t('common.noResources')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('teacher.resourcesDesc')}</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r, i) => {
            const cfg = resConfig[r.type] || resConfig.link;
            const Icon = cfg.icon;
            return (
              <motion.div key={r.id} variants={fadeUp} custom={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cfg.gradient}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${cfg.bg} bg-opacity-80`}>
                    {r.type === 'pdf' ? t('teacher.resourcePdf') : r.type === 'youtube' ? t('teacher.resourceYoutube') : t('teacher.resourceLink')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{r.title}</h3>
                {r.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{r.description}</p>}
                <p className="text-[10px] text-gray-400 truncate mb-4 font-mono">{r.url}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium">{r.class?.name || t('common.allClasses')}</span>
                  <div className="flex items-center gap-1">
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button onClick={() => deleteResource(r.id)}
                      className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('teacher.addResource')} size="md">
        <form onSubmit={addResource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.resourceTitle')} <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["pdf", "youtube", "link"].map((type) => {
              const cfg = resConfig[type] || resConfig.link;
              const active = form.type === type;
              return (
                <button key={type} type="button" onClick={() => setForm((p) => ({ ...p, type }))}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                    active ? "border-transparent text-white shadow-md" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  } ${active ? `bg-gradient-to-br ${cfg.gradient}` : ""}`}>
                  <cfg.icon className="h-4 w-4" />
                  {type === "pdf" ? "PDF" : type === "youtube" ? "YouTube" : "Link"}
                </button>
              );
            })}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.resourceUrl')} <span className="text-red-400">*</span></label>
            <input type="url" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.resourceClass')}</label>
              <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all">
                <option value="">{t('common.allClasses')}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.resourceDescription')}</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={1}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25 hover:shadow-xl"
            }`}>{loading ? "Saving..." : t('common.save')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
