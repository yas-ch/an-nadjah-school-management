"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  Search,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import { useI18n } from "@/lib/i18n-context";

interface SubjectTeacher {
  id: string;
  name: string;
  email: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string | null;
  teacherId: string | null;
  teacher: SubjectTeacher | null;
  createdAt: string | Date;
}

interface SubjectsManagerProps {
  initialData: SubjectItem[];
  teachers: { id: string; name: string; email: string }[];
}

export default function SubjectsManager({ initialData, teachers }: SubjectsManagerProps) {
  const { t: tr } = useI18n();
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<SubjectItem | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ name: "", code: "", teacherId: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch {
      showToast("Failed to fetch subjects", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teacherId: form.teacherId || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create subject");
      }
      showToast("Subject created successfully");
      setAddOpen(false);
      setForm({ name: "", code: "", teacherId: "" });
      await fetchSubjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create subject", "error");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...form, teacherId: form.teacherId || null }),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      showToast("Subject updated successfully");
      setEditOpen(false);
      setSelected(null);
      await fetchSubjects();
    } catch {
      showToast("Failed to update subject", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/subjects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }) });
      if (!res.ok) throw new Error("Failed to delete subject");
      showToast("Subject deleted successfully");
      setDeleteOpen(false);
      setSelected(null);
      await fetchSubjects();
    } catch {
      showToast("Failed to delete subject", "error");
    }
  };

  const openEdit = (s: SubjectItem) => {
    setSelected(s);
    setForm({ name: s.name, code: s.code || "", teacherId: s.teacherId || "" });
    setEditOpen(true);
  };

  const openDelete = (s: SubjectItem) => {
    setSelected(s);
    setDeleteOpen(true);
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.teacher?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.subjectsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{subjects.length} {tr('admin.subjectsOffered')}</p>
        </div>
        <button onClick={() => { setForm({ name: "", code: "", teacherId: "" }); setAddOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all"
        >
          <Plus className="h-4 w-4" />
          {tr('common.addSubject')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: tr('admin.subjectsTitle'), value: subjects.length, color: "from-violet-500 to-violet-600", icon: BookMarked },
          { label: tr('admin.assignedTeachers'), value: subjects.filter(s => s.teacher).length, color: "from-blue-500 to-blue-600", icon: GraduationCap },
          { label: tr('admin.subjectUnassigned'), value: subjects.filter(s => !s.teacher).length, color: "from-amber-500 to-amber-600", icon: AlertTriangle },
          { label: tr('admin.withCode'), value: subjects.filter(s => s.code).length, color: "from-emerald-500 to-emerald-600", icon: CheckCircle },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder={tr('common.searchSubjects')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" /></div>
      ) : subjects.length === 0 ? (
        <EmptyState icon={BookMarked} title={tr('common.noSubjects')} description="Click 'Add Subject' to create your first subject."
          action={<button onClick={() => { setForm({ name: "", code: "", teacherId: "" }); setAddOpen(true); }}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">{tr('common.addSubject')}</button>}
        />
      ) : (
        <DataTable
          data={filtered}
          keyField="id"
          columns={[
            {
              key: "name", label: tr('admin.subjectName'),
              render: (s) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-md">
                    <BookMarked className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {s.code && <p className="text-xs text-gray-500 font-mono">{s.code}</p>}
                  </div>
                </div>
              ),
            },
            {
              key: "teacher", label: tr('admin.assignTeacher'),
              render: (s) => (
                s.teacher ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{s.teacher.name.charAt(0)}</div>
                    <span className="text-gray-700">{s.teacher.name}</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">{tr('common.unassigned')}</span>
                )
              ),
            },
            {
              key: "createdAt", label: tr('common.date'),
              render: (s) => <span className="text-gray-500">{new Date(String(s.createdAt)).toLocaleDateString()}</span>,
            },
            {
              key: "actions", label: "", className: "text-right",
              render: (s) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title={tr('common.edit')}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => openDelete(s)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors" title={tr('common.delete')}><Trash2 className="h-4 w-4" /></button>
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={tr('common.addSubject')} size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.subjectName')} <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.code')}</label>
            <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="e.g. MATH101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.assignTeacher')}</label>
            <select value={form.teacherId} onChange={(e) => setForm(p => ({ ...p, teacherId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.unassigned')}</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">
              {tr('common.addSubject')}
            </button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={tr('common.editSubject')} size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.subjectName')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.code')}</label>
            <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.assignTeacher')}</label>
            <select value={form.teacherId} onChange={(e) => setForm(p => ({ ...p, teacherId: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.unassigned')}</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">
              {tr('common.saveChanges')}
            </button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={tr('common.deleteSubject')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{tr('common.confirmDelete')} <strong>{selected?.name}</strong>? {tr('common.cannotUndo')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors">{tr('common.delete')}</button>
            <button type="button" onClick={() => { setDeleteOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
