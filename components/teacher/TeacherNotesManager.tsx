"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { StickyNote, Plus, Trash2, Pencil, CheckCircle, AlertTriangle, User, Users, AlertCircle, BookOpen, Search, X } from "lucide-react";
import Modal from "@/components/admin/Modal";

interface NoteItem {
  id: string; content: string; type: string; subject: string | null;
  academicNote: string | null; behaviorNote: string | null;
  recommendation: string | null; status: string;
  teacherId: string;
  student?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
  createdAt: string | Date;
}
interface StudentItem { id: string; name: string }
interface ClassItem { id: string; name: string }
interface SubjectItem { id: string; name: string }
interface Props { notes: NoteItem[]; students: StudentItem[]; classes: ClassItem[]; subjects: SubjectItem[] }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; gradient: string }> = {
  class: { icon: Users, label: "Class Note", gradient: "from-blue-400 to-indigo-500" },
  student: { icon: User, label: "Student Note", gradient: "from-violet-400 to-purple-500" },
  behavior: { icon: AlertCircle, label: "Behavior Note", gradient: "from-amber-400 to-orange-500" },
};

export default function TeacherNotesManager({ notes: initial, students, classes, subjects }: Props) {
  const { t } = useI18n();
  const [notes, setNotes] = useState<NoteItem[]>(initial);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  }, []);
  const [form, setForm] = useState({
    content: "", type: "class" as string, subject: "",
    academicNote: "", behaviorNote: "", recommendation: "", status: "active",
    studentId: "", classId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupBySubject, setGroupBySubject] = useState(true);

  const filteredStudents = form.classId
    ? students
    : [];

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setLoading(true);
    try {
      const method = editId ? "PUT" : "POST";
      const body = editId ? { id: editId, ...form } : form;
      const res = await fetch("/api/shared-notes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const d = await res.json();
      if (editId) {
        setNotes((p) => p.map((n) => n.id === editId ? { ...d.note, student: d.note.student || null, class: d.note.class || null } : n));
        showToast("Note updated");
      } else {
        setNotes((p) => [{ ...d.note, student: d.note.student || null, class: d.note.class || null }, ...p]);
        showToast("Note shared with students & parents");
      }
      setAddOpen(false);
      setEditId(null);
      setForm({ content: "", type: "class", subject: "", academicNote: "", behaviorNote: "", recommendation: "", status: "active", studentId: "", classId: "" });
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to save note", "error"); }
    finally { setLoading(false); }
  };

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch("/api/shared-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setNotes((p) => p.filter((n) => n.id !== id));
      showToast("Note removed");
    } catch { showToast("Failed to delete", "error"); }
  };

  const openEdit = (n: NoteItem) => {
    setForm({
      content: n.content, type: n.type, subject: n.subject || "",
      academicNote: n.academicNote || "", behaviorNote: n.behaviorNote || "",
      recommendation: n.recommendation || "", status: n.status,
      studentId: n.student?.id || "", classId: n.class?.id || "",
    });
    setEditId(n.id);
    setAddOpen(true);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ content: "", type: "class", subject: "", academicNote: "", behaviorNote: "", recommendation: "", status: "active", studentId: "", classId: "" });
    setAddOpen(true);
  };

  const filtered = search
    ? notes.filter((n) =>
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        n.subject?.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  const grouped = groupBySubject
    ? filtered.reduce<Record<string, NoteItem[]>>((acc, n) => {
        const key = n.subject || "General";
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
      }, {})
    : { "All Notes": filtered };

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
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <StickyNote className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('teacher.notesTitle')}</h1>
              <p className="text-indigo-200 text-sm">{t('teacher.notesDesc')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/30 hover:bg-white/30 transition-all">
            <Plus className="h-4 w-4" /> {t('teacher.addNote')}
          </motion.button>
        </div>
      </motion.div>

      {/* Search + Toggle */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button onClick={() => setGroupBySubject(!groupBySubject)}
          className={`shrink-0 rounded-xl px-4 py-3 text-xs font-medium transition-all border ${
            groupBySubject ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}>
          <BookOpen className="h-4 w-4 inline mr-1.5" />
          {groupBySubject ? "Grouped" : "Flat"}
        </button>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400">
            <StickyNote className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-900">{search ? "No notes match your search" : t('common.noNotes')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('teacher.notesDesc')}</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subjectKey, subjectNotes]) => (
            <motion.div key={subjectKey} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-500">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{subjectKey}</h2>
                <span className="text-xs text-gray-400">({subjectNotes.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {subjectNotes.map((n, i) => {
                  const cfg = typeConfig[n.type] || typeConfig.class;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={n.id} variants={fadeUp} custom={i}
                      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cfg.gradient}`} />
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                              {n.type === 'class' ? t('teacher.noteClass') : n.type === 'behavior' ? t('teacher.noteBehavior') : t('teacher.noteStudent')}
                            </span>
                            {n.student && <span className="text-[10px] text-gray-400">· {n.student.name}</span>}
                            {n.class && <span className="text-[10px] text-gray-400">· {n.class.name}</span>}
                            {n.subject && <span className="text-[10px] text-indigo-500 font-medium">· {n.subject}</span>}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">{new Date(String(n.createdAt)).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <button onClick={() => openEdit(n)}
                            className="rounded-lg p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteNote(n.id)}
                            className="rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-2">{n.content}</p>
                      {(n.academicNote || n.behaviorNote || n.recommendation) && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-gray-50">
                          {n.academicNote && (
                            <div className="rounded-lg bg-blue-50/50 px-2.5 py-1.5">
                              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Academic</span>
                              <p className="text-xs text-gray-600 mt-0.5">{n.academicNote}</p>
                            </div>
                          )}
                          {n.behaviorNote && (
                            <div className="rounded-lg bg-amber-50/50 px-2.5 py-1.5">
                              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Behavior</span>
                              <p className="text-xs text-gray-600 mt-0.5">{n.behaviorNote}</p>
                            </div>
                          )}
                          {n.recommendation && (
                            <div className="rounded-lg bg-emerald-50/50 px-2.5 py-1.5">
                              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Recommendation</span>
                              <p className="text-xs text-gray-600 mt-0.5">{n.recommendation}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          n.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {n.status === "active" ? "Active" : "Archived"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditId(null); }} title={editId ? "Edit Note" : t('teacher.addNote')} size="lg">
        <form onSubmit={addNote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.noteType')} <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {["class", "student", "behavior"].map((type) => {
                const cfg = typeConfig[type] || typeConfig.class;
                const active = form.type === type;
                return (
                  <button key={type} type="button" onClick={() => setForm((p) => ({ ...p, type, studentId: "" }))}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all ${
                      active ? "border-transparent text-white shadow-md" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    } ${active ? `bg-gradient-to-br ${cfg.gradient}` : ""}`}>
                    <cfg.icon className="h-4 w-4" />
                    {type === 'class' ? t('teacher.noteClass') : type === 'behavior' ? t('teacher.noteBehavior') : t('teacher.noteStudent')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')}</label>
              <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">{t('common.allClasses')}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.subject')}</label>
              <select value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">General</option>
                {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {(form.type === "student" || form.type === "behavior") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.noteStudent')}</label>
              <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">{t('common.selectStudent')}</option>
                {(form.classId ? filteredStudents : students).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.noteContent')} <span className="text-red-400">*</span></label>
            <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={2} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Academic Note</label>
              <textarea value={form.academicNote} onChange={(e) => setForm((p) => ({ ...p, academicNote: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Behavior Note</label>
              <textarea value={form.behaviorNote} onChange={(e) => setForm((p) => ({ ...p, behaviorNote: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recommendation</label>
              <textarea value={form.recommendation} onChange={(e) => setForm((p) => ({ ...p, recommendation: e.target.value }))} rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <div className="flex gap-2">
              {["active", "archived"].map((st) => (
                <button key={st} type="button" onClick={() => setForm((p) => ({ ...p, status: st }))}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    form.status === st
                      ? st === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-gray-100 text-gray-600 border-gray-300"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}>
                  {st === "active" ? "Active" : "Archived"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/25 hover:shadow-xl"
              }`}>
              {loading ? "Saving..." : editId ? "Update Note" : t('common.save')}
            </button>
            <button type="button" onClick={() => { setAddOpen(false); setEditId(null); }}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
