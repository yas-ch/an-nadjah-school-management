"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Search, Plus, Pencil, Trash2, GraduationCap,
  CheckCircle, AlertTriangle, Users, TrendingUp, LayoutGrid, List,
} from "lucide-react";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import { useI18n } from "@/lib/i18n-context";

interface ClassTeacher { id: string; name: string; email?: string; }
interface ClassItem {
  id: string; name: string; section: string; teacherId: string;
  teacher?: ClassTeacher | null;
  _count?: { grades: number; attendance?: number };
  createdAt: string | Date;
}
interface ClassesManagerProps {
  initialData: ClassItem[];
  teachers: { id: string; name: string }[];
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function ClassesManager({ initialData, teachers }: ClassesManagerProps) {
  const { t: tr } = useI18n();
  const [classes, setClasses] = useState<ClassItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ClassItem | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ name: "", section: "", teacherId: "" });

  const showToast = useCallback((m: string, t: "success" | "error" = "success") => {
    setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/classes"); const d = await res.json(); setClasses(d.classes || []); }
    catch { showToast("Failed to fetch classes", "error"); } finally { setLoading(false); }
  }, [showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed to create class");
      showToast("Class created successfully"); setAddOpen(false); setForm({ name: "", section: "", teacherId: "" }); await fetchClasses();
    } catch { showToast("Failed to create class", "error"); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/classes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...form }) });
      if (!res.ok) throw new Error("Failed to update class");
      showToast("Class updated successfully"); setEditOpen(false); setSelected(null); await fetchClasses();
    } catch { showToast("Failed to update class", "error"); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/classes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }) });
      if (!res.ok) throw new Error("Failed to delete class");
      showToast("Class deleted successfully"); setDeleteOpen(false); setSelected(null); await fetchClasses();
    } catch { showToast("Failed to delete class", "error"); }
  };

  const openEdit = (c: ClassItem) => { setSelected(c); setForm({ name: c.name, section: c.section, teacherId: c.teacherId || "" }); setEditOpen(true); };
  const openDelete = (c: ClassItem) => { setSelected(c); setDeleteOpen(true); };

  const filtered = classes.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.section.toLowerCase().includes(search.toLowerCase()) || (c.teacher?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalGrades = classes.reduce((s, c) => s + (c._count?.grades || 0), 0);

  const gradientColors = ["from-blue-400 to-blue-600", "from-emerald-400 to-emerald-600", "from-violet-400 to-violet-600", "from-amber-400 to-amber-600", "from-rose-400 to-rose-600", "from-indigo-400 to-indigo-600"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {toast && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className={`fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
          toast.type === "success" ? "bg-green-50/90 text-green-800 border border-green-200" : "bg-red-50/90 text-red-800 border border-red-200"
        }`}>
        {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {toast.message}
      </motion.div>}

      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.classesTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{classes.length} {tr('admin.classesSemester')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"}`} title={tr('common.table')}><List className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("cards")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "cards" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"}`} title={tr('common.cards')}><LayoutGrid className="h-4 w-4" /></button>
          </div>
          <button onClick={() => { setForm({ name: "", section: "", teacherId: "" }); setAddOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all"
          ><Plus className="h-4 w-4" /> {tr('common.addClass')}</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: tr('admin.totalClasses'), value: classes.length, icon: BookOpen, color: "from-violet-500 to-violet-600", detail: tr('common.active') },
          { label: tr('admin.teachersAssigned'), value: classes.filter(c => c.teacher).length, icon: GraduationCap, color: "from-blue-500 to-blue-600", detail: tr('admin.withTeachers') },
          { label: tr('admin.totalGradeRecords'), value: totalGrades, icon: TrendingUp, color: "from-emerald-500 to-emerald-600", detail: tr('admin.acrossClasses') },
          { label: tr('common.unassigned'), value: classes.filter(c => !c.teacher).length, icon: AlertTriangle, color: "from-amber-500 to-amber-600", detail: tr('admin.classNoTeacher') },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.detail}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder={tr('common.searchClasses')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" /></div>
      ) : classes.length === 0 ? (
        <EmptyState icon={BookOpen} title={tr('common.noClasses')} description="Click 'Add Class' to create your first class."
          action={<button onClick={() => { setForm({ name: "", section: "", teacherId: "" }); setAddOpen(true); }}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">{tr('common.addClass')}</button>}
        />
      ) : viewMode === "cards" ? (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientColors[i % gradientColors.length]}`} />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} text-white shadow-lg`}>
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.section || "No section"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{c.teacher?.name || <span className="text-amber-600 font-medium">{tr('common.unassigned')}</span>}</span>
                </div>
                <span className="text-xs text-gray-500">{c._count?.grades || 0} {tr('common.grade_' + ((c._count?.grades ?? 0) === 1 ? 'one' : 'other'))}</span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <button onClick={() => openEdit(c)} className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                  <Pencil className="h-3.5 w-3.5 inline mr-1" /> {tr('common.edit')}
                </button>
                <button onClick={() => openDelete(c)} className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 className="h-3.5 w-3.5 inline mr-1" /> {tr('common.delete')}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <DataTable
            data={filtered} keyField="id"
            columns={[
              { key: "name", label: tr('admin.className'), render: (c) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-md">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.section || "No section"}</p></div>
                </div>
              )},
              { key: "teacher", label: tr('nav.teachers'), render: (c) => (
                <span className="inline-flex items-center gap-1 text-gray-700">
                  <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                  {c.teacher?.name || <span className="text-amber-600 font-medium">{tr('common.unassigned')}</span>}
                </span>
              )},
              { key: "grades", label: tr('common.records'), className: "text-center", render: (c) => (
                <span className="font-medium text-gray-700">{c._count?.grades || 0} {tr('common.grade_' + ((c._count?.grades ?? 0) === 1 ? 'one' : 'other'))}</span>
              )},
              { key: "actions", label: "", className: "text-right", render: (c) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title={tr('common.edit')}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => openDelete(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors" title={tr('common.delete')}><Trash2 className="h-4 w-4" /></button>
                </div>
              )},
            ]}
          />
        </motion.div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={tr('common.addClass')} size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.className')} <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="e.g. Grade 10A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.section')}</label>
            <input type="text" value={form.section} onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="e.g. Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.assignTeacher')}</label>
            <select value={form.teacherId} onChange={(e) => setForm(p => ({ ...p, teacherId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.unassigned')}</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">{tr('common.addClass')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={tr('common.editClass')} size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.className')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.section')}</label>
            <input type="text" value={form.section} onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.selectTeacher')}</label>
            <select value={form.teacherId} onChange={(e) => setForm(p => ({ ...p, teacherId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.unassigned')}</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">{tr('common.saveChanges')}</button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={tr('common.deleteClass')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{tr('common.confirmDelete')} <strong>{selected?.name}</strong>? {tr('common.cannotUndo')} All associated grades and attendance records will also be removed.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="flex-1 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">{tr('common.delete')}</button>
            <button type="button" onClick={() => { setDeleteOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
