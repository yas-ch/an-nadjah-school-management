"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import StatCard from "@/components/dashboard/StatCard";
import { useI18n } from "@/lib/i18n-context";

interface GradeItem {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  score: number;
  grade: string;
  createdAt: string | Date;
  student?: { id: string; name: string; email?: string };
  class?: { id: string; name: string };
}

interface GradesManagerProps {
  initialData: GradeItem[];
  students: { id: string; name: string }[];
  classes: { id: string; name: string }[];
}

export default function GradesManager({ initialData, students, classes }: GradesManagerProps) {
  const { t: tr } = useI18n();
  const [grades, setGrades] = useState<GradeItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<GradeItem | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({ studentId: "", classId: "", subject: "", score: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classFilter) params.set("classId", classFilter);
      const res = await fetch(`/api/grades?${params}`);
      const data = await res.json();
      setGrades(data.grades || []);
    } catch {
      showToast("Failed to fetch grades", "error");
    } finally {
      setLoading(false);
    }
  }, [classFilter, showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score: parseFloat(form.score) }),
      });
      if (!res.ok) throw new Error("Failed to add grade");
      showToast("Grade added successfully");
      setAddOpen(false);
      setForm({ studentId: "", classId: "", subject: "", score: "" });
      await fetchGrades();
    } catch {
      showToast("Failed to add grade", "error");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          ...form,
          score: parseFloat(form.score),
        }),
      });
      if (!res.ok) throw new Error("Failed to update grade");
      showToast("Grade updated successfully");
      setEditOpen(false);
      setSelected(null);
      await fetchGrades();
    } catch {
      showToast("Failed to update grade", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/grades", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      if (!res.ok) throw new Error("Failed to delete grade");
      showToast("Grade deleted successfully");
      setDeleteOpen(false);
      setSelected(null);
      await fetchGrades();
    } catch {
      showToast("Failed to delete grade", "error");
    }
  };

  const openEdit = (g: GradeItem) => {
    setSelected(g);
    setForm({
      studentId: g.studentId,
      classId: g.classId,
      subject: g.subject,
      score: String(g.score),
    });
    setEditOpen(true);
  };

  const openDelete = (g: GradeItem) => {
    setSelected(g);
    setDeleteOpen(true);
  };

  const filtered = grades.filter((g) => {
    const matchSearch =
      !search ||
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      g.student?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const avgScore =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr('admin.gradesTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{grades.length} {tr('admin.gradesRecorded')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr('admin.totalGrades')} value={grades.length.toString()} change={tr('common.allTime')} icon={ClipboardList} color="blue" />
        <StatCard title={tr('admin.averageScore')} value={avgScore ? `${avgScore}%` : "N/A"} change={tr('common.acrossAll')} icon={TrendingUp} color="green" />
        <StatCard title={tr('admin.studentsTitle')} value={students.length.toString()} change={tr('common.enrolled')} icon={Award} color="purple" />
        <StatCard title={tr('admin.classesTitle')} value={classes.length.toString()} change={tr('common.active')} icon={BarChart3} color="orange" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={tr('common.searchGrades')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">{tr('common.allClasses')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setForm({ studentId: "", classId: "", subject: "", score: "" }); setAddOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {tr('common.addGrade')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
        </div>
      ) : grades.length === 0 ? (
        <EmptyState icon={ClipboardList} title={tr('common.noGrades')} description="Click 'Add Grade' to record the first grade." />
      ) : (
        <DataTable
          data={filtered}
          keyField="id"
          columns={[
            {
              key: "student",
              label: tr('admin.studentsTitle'),
              render: (g) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {g.student?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{g.student?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{g.class?.name || ""}</p>
                  </div>
                </div>
              ),
            },
            { key: "subject", label: tr('admin.subject'), render: (g) => <span className="text-gray-700">{g.subject}</span> },
            {
              key: "score",
              label: tr('admin.score'),
              render: (g) => <span className="font-medium text-gray-900">{g.score}%</span>,
            },
            {
              key: "grade",
              label: "Grade",
              render: (g) => {
                const gradeStr = g.grade as string;
                const color = gradeStr.startsWith("A") ? "text-green-600 bg-green-50"
                  : gradeStr.startsWith("B") ? "text-blue-600 bg-blue-50"
                  : gradeStr.startsWith("C") ? "text-yellow-600 bg-yellow-50"
                  : "text-red-600 bg-red-50";
                return (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
                    {gradeStr}
                  </span>
                );
              },
            },
            {
              key: "createdAt",
              label: tr('common.date'),
              render: (g) => (
                <span className="text-gray-500">{new Date(String(g.createdAt)).toLocaleDateString()}</span>
              ),
            },
            {
              key: "actions",
              label: "",
              className: "text-right",
              render: (g) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(g)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title={tr('common.edit')}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => openDelete(g)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors" title={tr('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={tr('common.addGrade')} size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.studentsTitle')} <span className="text-red-500">*</span></label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.selectStudent')}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.selectClass')} <span className="text-red-500">*</span></label>
            <select
              value={form.classId}
              onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.selectClass')}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.subject')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.score')} <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.score}
              onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="0-100"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              {tr('common.addGrade')}
            </button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={tr('common.editGrade')} size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.studentsTitle')}</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.selectStudent')}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.selectClass')}</label>
            <select
              value={form.classId}
              onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{tr('common.selectClass')}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.subject')}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('admin.score')}</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.score}
              onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              {tr('common.saveChanges')}
            </button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={tr('common.deleteGrade')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{tr('common.confirmDelete')} {tr('common.cannotUndo')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              {tr('common.delete')}
            </button>
            <button type="button" onClick={() => { setDeleteOpen(false); setSelected(null); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
