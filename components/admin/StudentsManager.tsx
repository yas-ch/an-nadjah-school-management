"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Plus, Pencil, Trash2, GraduationCap, Phone, Mail,
  CheckCircle, AlertTriangle, BookOpen, Calendar, LayoutGrid, List,
} from "lucide-react";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import { useI18n } from "@/lib/i18n-context";

interface Student {
  id: string; name: string; email: string; role: string; createdAt: string | Date;
  studentProfile?: { grade: string; guardian: string; phone: string; address: string } | null;
  _count?: { grades: number; attendance: number };
}

interface StudentsManagerProps {
  initialData: Student[];
  classes: { id: string; name: string }[];
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function StudentsManager({ initialData, classes }: StudentsManagerProps) {
  const { t: tr } = useI18n();
  const [students, setStudents] = useState<Student[]>(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "", grade: "", guardian: "", phone: "", address: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/users?role=student"); const d = await res.json(); setStudents(d.users || []); }
    catch { showToast("Failed to fetch students", "error"); } finally { setLoading(false); }
  }, [showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, role: "student" }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to create student"); }
      showToast("Student added successfully");
      setAddOpen(false);
      setForm({ name: "", email: "", password: "", grade: "", guardian: "", phone: "", address: "" });
      await fetchStudents();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to create student", "error"); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...form }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to update student"); }
      showToast("Student updated successfully"); setEditOpen(false); setSelected(null); await fetchStudents();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to update student", "error"); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to delete student"); }
      showToast("Student deleted successfully"); setDeleteOpen(false); setSelected(null); await fetchStudents();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to delete student", "error"); }
  };

  const openEdit = (s: Student) => {
    setSelected(s);
    setForm({ name: s.name, email: s.email, password: "", grade: s.studentProfile?.grade || "", guardian: s.studentProfile?.guardian || "", phone: s.studentProfile?.phone || "", address: s.studentProfile?.address || "" });
    setEditOpen(true);
  };

  const openDelete = (s: Student) => { setSelected(s); setDeleteOpen(true); };

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || (s.studentProfile?.grade || "").toLowerCase().includes(search.toLowerCase())
  );

  const formFields = [
    { label: tr('admin.fullName'), key: "name", type: "text", required: true },
    { label: tr('common.email'), key: "email", type: "email", required: true },
    { label: tr('common.password'), key: "password", type: "password", required: false },
    { label: "Grade", key: "grade", type: "text", required: false },
    { label: tr('admin.guardian'), key: "guardian", type: "text", required: false },
    { label: tr('common.phone'), key: "phone", type: "text", required: false },
    { label: tr('common.address'), key: "address", type: "text", required: false },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">{tr('admin.studentsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{students.length} {tr('admin.studentsEnrolled')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"}`} title={tr('common.table')}><List className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("cards")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "cards" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"}`} title={tr('common.cards')}><LayoutGrid className="h-4 w-4" /></button>
          </div>
          <button onClick={() => { setForm({ name: "", email: "", password: "", grade: "", guardian: "", phone: "", address: "" }); setAddOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all"
          ><Plus className="h-4 w-4" /> {tr('common.addStudent')}</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: tr('admin.totalStudents'), value: students.length, icon: Users, color: "from-blue-500 to-blue-600", detail: tr('common.enrolled') },
          { label: tr('admin.avgGradesPerStudent'), value: students.length > 0 ? (students.reduce((s, st) => s + (st._count?.grades || 0), 0) / students.length).toFixed(1) : "0", icon: BookOpen, color: "from-violet-500 to-violet-600", detail: tr('common.perStudent') },
          { label: tr('admin.attendanceRecords'), value: students.reduce((s, st) => s + (st._count?.attendance || 0), 0), icon: Calendar, color: "from-amber-500 to-amber-600", detail: tr('admin.totalTracked') },
          { label: tr('common.active'), value: students.filter(s => (s._count?.grades || 0) > 0).length, icon: CheckCircle, color: "from-emerald-500 to-emerald-600", detail: tr('common.withGrades') },
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
        <input type="text" placeholder={tr('common.searchStudents')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" /></div>
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title={tr('common.noStudents')} description="Click 'Add Student' to enroll your first student."
          action={<button onClick={() => { setForm({ name: "", email: "", password: "", grade: "", guardian: "", phone: "", address: "" }); setAddOpen(true); }}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">{tr('common.addStudent')}</button>}
        />
      ) : viewMode === "cards" ? (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-500/20 mb-3">
                  {s.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {s.email}</p>
                {s.studentProfile?.grade && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 mt-2">
                    <GraduationCap className="h-3 w-3" /> {s.studentProfile.grade}
                  </span>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {s._count?.grades || 0} {tr('common.grade_' + ((s._count?.grades ?? 0) === 1 ? 'one' : 'other'))}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {s._count?.attendance || 0} {tr('common.record_' + ((s._count?.attendance ?? 0) === 1 ? 'one' : 'other'))}</span>
                </div>
                {s.studentProfile?.guardian && <p className="text-xs text-gray-400 mt-2">{tr('admin.guardian')}: {s.studentProfile.guardian}</p>}
                <div className="flex items-center gap-2 mt-4 w-full">
                  <button onClick={() => openEdit(s)} className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <Pencil className="h-3.5 w-3.5 inline mr-1" /> {tr('common.edit')}
                  </button>
                  <button onClick={() => openDelete(s)} className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all">
                    <Trash2 className="h-3.5 w-3.5 inline mr-1" /> {tr('common.delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <DataTable
            data={filtered} keyField="id"
            columns={[
              { key: "name", label: tr('admin.studentsTitle'), render: (s) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-md">
                    {s.name.charAt(0)}
                  </div>
                  <div><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
                </div>
              )},
              { key: "grade", label: "Grade", render: (s) => (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <GraduationCap className="h-3 w-3" /> {s.studentProfile?.grade || "—"}
                </span>
              )},
              { key: "guardian", label: tr('admin.guardian'), render: (s) => <span className="text-gray-700">{s.studentProfile?.guardian || "—"}</span> },
              { key: "stats", label: tr('common.records'), render: (s) => (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{s._count?.grades || 0} {tr('common.grade_' + ((s._count?.grades ?? 0) === 1 ? 'one' : 'other'))}</span>
                  <span>{s._count?.attendance || 0} {tr('common.record_' + ((s._count?.attendance ?? 0) === 1 ? 'one' : 'other'))}</span>
                </div>
              )},
              { key: "phone", label: tr('common.phone'), render: (s) => (
                <span className="flex items-center gap-1 text-gray-700"><Phone className="h-3.5 w-3.5 text-gray-400" />{s.studentProfile?.phone || "—"}</span>
              )},
              { key: "createdAt", label: tr('common.enrolled'), render: (s) => <span className="text-gray-500">{new Date(String(s.createdAt)).toLocaleDateString()}</span> },
              { key: "actions", label: "", className: "text-right", render: (s) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title={tr('common.edit')}><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => openDelete(s)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors" title={tr('common.delete')}><Trash2 className="h-4 w-4" /></button>
                </div>
              )},
            ]}
          />
        </motion.div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={tr('common.addStudent')} size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} {f.required && f.key !== "password" && <span className="text-red-500">*</span>}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.required && f.key !== "password"}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder={`Enter ${f.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.selectClass')}</label>
            <select className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">{tr('common.selectClass')}</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">{tr('common.addStudent')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={tr('common.editStudent')} size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formFields.filter(f => f.key !== "password").map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all">{tr('common.saveChanges')}</button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{tr('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={tr('common.deleteStudent')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{tr('common.confirmDelete')} <strong>{selected?.name}</strong>? {tr('common.cannotUndo')}</p>
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
