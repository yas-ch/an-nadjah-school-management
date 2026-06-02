"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import {
  FileSpreadsheet, Plus, Pencil, Trash2, CheckCircle, AlertTriangle,
  Filter, BarChart3, TrendingUp, X, Award,
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import Modal from "@/components/admin/Modal";

interface TeacherClass { id: string; name: string }
interface GradeItem {
  id: string; studentId: string; classId: string; subject: string;
  score: number; grade: string; createdAt: string | Date;
  student?: { id: string; name: string }; class?: { id: string; name: string }
}
interface StudentItem { id: string; name: string }
interface Props { classes: TeacherClass[]; grades: GradeItem[]; students: StudentItem[] }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const perfBadge = (score: number) => {
  if (score >= 16) return { label: "Excellent", bg: "bg-emerald-100 text-emerald-700 ring-emerald-600/20" };
  if (score >= 14) return { label: "Very Good", bg: "bg-blue-100 text-blue-700 ring-blue-600/20" };
  if (score >= 12) return { label: "Good", bg: "bg-amber-100 text-amber-700 ring-amber-600/20" };
  if (score >= 10) return { label: "Average", bg: "bg-orange-100 text-orange-700 ring-orange-600/20" };
  return { label: "Needs Improvement", bg: "bg-red-100 text-red-700 ring-red-600/20" };
};

const gradeColor = (g: string) =>
  g.startsWith("A") ? "text-emerald-600 bg-emerald-50 ring-emerald-600/20" : g.startsWith("B") ? "text-blue-600 bg-blue-50 ring-blue-600/20"
  : g.startsWith("C") ? "text-amber-600 bg-amber-50 ring-amber-600/20" : g.startsWith("D") ? "text-orange-600 bg-orange-50 ring-orange-600/20"
  : "text-red-600 bg-red-50 ring-red-600/20";

export default function TeacherGradesManager({ classes, grades: initialGrades, students }: Props) {
  const { t } = useI18n();
  const [grades, setGrades] = useState<GradeItem[]>(initialGrades);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<GradeItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ studentId: "", classId: "", subject: "", score: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClassId) params.set("classId", selectedClassId);
      const res = await fetch(`/api/grades?${params}`);
      const data = await res.json();
      setGrades(data.grades || []);
    } catch { showToast("Failed to fetch grades", "error"); }
    finally { setLoading(false); }
  }, [selectedClassId, showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, score: parseFloat(form.score) }) });
      if (!res.ok) throw new Error();
      showToast("Grade added successfully");
      setAddOpen(false);
      setForm({ studentId: "", classId: "", subject: "", score: "" });
      await fetchGrades();
    } catch { showToast("Failed to add grade", "error"); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/grades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...form, score: parseFloat(form.score) }) });
      if (!res.ok) throw new Error();
      showToast("Grade updated");
      setEditOpen(false); setSelected(null);
      await fetchGrades();
    } catch { showToast("Failed to update", "error"); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/grades", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }) });
      if (!res.ok) throw new Error();
      showToast("Grade deleted");
      setDeleteOpen(false); setSelected(null);
      await fetchGrades();
    } catch { showToast("Failed to delete", "error"); }
  };

  const filtered = selectedClassId ? grades.filter((g) => g.classId === selectedClassId) : grades;
  const avgScore = filtered.length ? (filtered.reduce((s, g) => s + g.score, 0) / filtered.length).toFixed(1) : null;
  const passCount = filtered.filter((g) => g.score >= 10).length;
  const passRate = filtered.length ? ((passCount / filtered.length) * 100).toFixed(0) : null;

  const uniqueSubjects = Array.from(new Set(filtered.map((g) => g.subject)));
  const subjectAverages = uniqueSubjects.map((subj) => {
    const sg = filtered.filter((g) => g.subject === subj);
    return { subject: subj, avg: sg.reduce((s, g) => s + g.score, 0) / sg.length, count: sg.length };
  });

  const dist: Record<string, number> = { Excellent: 0, "Very Good": 0, Good: 0, Average: 0, "Needs Improvement": 0 };
  filtered.forEach((g) => {
    const p = perfBadge(g.score).label;
    if (dist[p] !== undefined) dist[p]++;
  });
  const maxDist = Math.max(...Object.values(dist), 1);
  const distColors: Record<string, string> = { Excellent: "bg-emerald-500", "Very Good": "bg-blue-500", Good: "bg-amber-500", Average: "bg-orange-500", "Needs Improvement": "bg-red-500" };

  return (
    <motion.div className="space-y-6 pb-10" variants={container} initial="hidden" animate="visible">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-xl border ${
              toast.type === "success" ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/50" : "bg-red-50/90 text-red-800 border-red-200/50"
            }`}>
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <FileSpreadsheet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('teacher.gradesTitle')}</h1>
              <p className="text-violet-200 text-sm">{t('teacher.totalGrades')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setForm({ studentId: "", classId: selectedClassId || classes[0]?.id || "", subject: "", score: "" }); setAddOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/30 hover:bg-white/30 transition-all">
            <Plus className="h-4 w-4" /> {t('common.addGrade')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        {[
          { label: t('common.total'), value: filtered.length, gradient: "from-violet-500 to-purple-500", icon: FileSpreadsheet },
          { label: "Class Avg", value: avgScore ? `${avgScore}/20` : "—", gradient: "from-blue-500 to-cyan-500", icon: TrendingUp },
          { label: "Pass Rate (≥10/20)", value: passRate ? `${passRate}%` : "—", gradient: "from-emerald-500 to-teal-500", icon: CheckCircle },
          { label: t('admin.subject'), value: uniqueSubjects.length, gradient: "from-amber-500 to-orange-500", icon: BarChart3 },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg shadow-gray-200/40 border border-gray-100">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                <stat.icon className={`h-4 w-4 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Subject Averages */}
      {subjectAverages.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/30 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Subject Averages</p>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {subjectAverages.map((sa) => (
              <div key={sa.subject} className="rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-100 text-center">
                <p className="text-xs font-medium text-gray-500 mb-1 truncate">{sa.subject}</p>
                <p className="text-xl font-bold text-gray-900">{sa.avg.toFixed(1)}/20</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sa.count} {sa.count === 1 ? "grade" : "grades"}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Distribution */}
      {filtered.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/30 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Performance Distribution</p>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(dist).map(([level, count]) => (
              <div key={level} className="text-center">
                <div className="h-24 flex items-end justify-center mb-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxDist) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`w-full max-w-[40px] rounded-lg ${distColors[level]} transition-all`}
                    style={{ minHeight: count > 0 ? "4px" : "0" }}
                  />
                </div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-[10px] font-semibold text-gray-500">{level}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all appearance-none cursor-pointer">
            <option value="">{t('common.allClasses')}</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedClassId && (
          <button onClick={() => setSelectedClassId("")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-all">
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-violet-500" />
            <div className="absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-violet-500/10" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp}>
          <EmptyState icon={FileSpreadsheet} title={t('common.noGrades')} description={t('common.noGrades')} />
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/30">
          <DataTable
            data={filtered}
            keyField="id"
            columns={[
              {
                key: "student", label: t('common.name'),
                render: (g) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-200 text-xs font-semibold text-violet-700 shadow-sm ring-2 ring-white">
                      {g.student?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium text-gray-900">{g.student?.name || "Unknown"}</span>
                  </div>
                ),
              },
              {
                key: "subject", label: t('admin.subject'),
                render: (g) => <span className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">{g.subject}</span>,
              },
              {
                key: "score", label: "Score (/20)",
                render: (g) => (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{g.score}/20</span>
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(g.score / 20) * 100}%` }}
                        className={`h-full rounded-full ${g.score >= 12 ? "bg-emerald-500" : g.score >= 10 ? "bg-amber-500" : "bg-red-500"}`} />
                    </div>
                  </div>
                ),
              },
              {
                key: "grade", label: t('common.grade_one'),
                render: (g) => (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${gradeColor(g.grade)}`}>{g.grade}</span>
                ),
              },
              {
                key: "performance", label: "Performance",
                render: (g) => {
                  const p = perfBadge(g.score);
                  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${p.bg}`}>{p.label}</span>;
                },
              },
              {
                key: "createdAt", label: t('common.date'),
                className: "text-right",
                render: (g) => <span className="text-sm text-gray-500">{new Date(String(g.createdAt)).toLocaleDateString()}</span>,
              },
              {
                key: "actions", label: "", className: "text-right",
                render: (g) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setSelected(g); setForm({ studentId: g.studentId, classId: g.classId, subject: g.subject, score: String(g.score) }); setEditOpen(true); }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-all" title={t('common.edit')}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setSelected(g); setDeleteOpen(true); }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all" title={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </motion.div>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('common.addGrade')} size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')} <span className="text-red-400">*</span></label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all">
              <option value="">{t('common.selectClass')}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.studentTitle')} <span className="text-red-400">*</span></label>
            <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all">
              <option value="">{t('common.selectStudent')}</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.subject')} <span className="text-red-400">*</span></label>
            <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" placeholder={t('admin.subject')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Score (/20) <span className="text-red-400">*</span></label>
            <input type="number" min="0" max="20" step="0.5" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" placeholder="0–20" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all">{t('common.addGrade')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={t('common.editGrade')} size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')}</label>
            <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.studentTitle')}</label>
            <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all">
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.subject')}</label>
            <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Score (/20)</label>
            <input type="number" min="0" max="20" step="0.5" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" placeholder="0–20" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all">{t('common.saveChanges')}</button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={t('common.deleteGrade')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{t('common.confirmDelete')} {t('common.grade_one')}? {t('common.cannotUndo')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="flex-1 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/25 hover:shadow-xl transition-all">{t('common.delete')}</button>
            <button onClick={() => { setDeleteOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}