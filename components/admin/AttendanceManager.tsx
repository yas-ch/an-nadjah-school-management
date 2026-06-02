"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  CheckCircle as CheckCircleSolid,
  AlertTriangle,
} from "lucide-react";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import StatCard from "@/components/dashboard/StatCard";
import { useI18n } from "@/lib/i18n-context";

interface AttendanceStudent {
  id: string;
  name: string;
}

interface AttendanceClass {
  id: string;
  name: string;
}

interface AttendanceItem {
  id: string;
  studentId: string;
  classId: string;
  date: string | Date;
  status: string;
  createdAt: string | Date;
  student?: AttendanceStudent;
  class?: AttendanceClass;
}

interface AttendanceManagerProps {
  initialData: AttendanceItem[];
  students: { id: string; name: string }[];
  classes: { id: string; name: string }[];
}

export default function AttendanceManager({ initialData, students, classes }: AttendanceManagerProps) {
  const { t: tr } = useI18n();
  const [attendance, setAttendance] = useState<AttendanceItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AttendanceItem | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({ studentId: "", classId: "", date: "", status: "present" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classFilter) params.set("classId", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      setAttendance(data.attendance || []);
    } catch {
      showToast("Failed to fetch attendance", "error");
    } finally {
      setLoading(false);
    }
  }, [classFilter, statusFilter, showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add attendance record");
      showToast("Attendance record added");
      setAddOpen(false);
      setForm({ studentId: "", classId: "", date: "", status: "present" });
      await fetchAttendance();
    } catch {
      showToast("Failed to add attendance record", "error");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, ...form }),
      });
      if (!res.ok) throw new Error("Failed to update attendance");
      showToast("Attendance record updated");
      setEditOpen(false);
      setSelected(null);
      await fetchAttendance();
    } catch {
      showToast("Failed to update attendance", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      if (!res.ok) throw new Error("Failed to delete attendance");
      showToast("Attendance record deleted");
      setDeleteOpen(false);
      setSelected(null);
      await fetchAttendance();
    } catch {
      showToast("Failed to delete attendance", "error");
    }
  };

  const openEdit = (a: AttendanceItem) => {
    setSelected(a);
    setForm({
      studentId: a.studentId,
      classId: a.classId,
      date: new Date(String(a.date)).toISOString().split("T")[0],
      status: a.status,
    });
    setEditOpen(true);
  };

  const openDelete = (a: AttendanceItem) => {
    setSelected(a);
    setDeleteOpen(true);
  };

  const filtered = attendance.filter((a) => {
    const matchSearch =
      !search ||
      a.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.class?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const total = attendance.length;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : "N/A";

  const statusStyles: Record<string, string> = {
    present: "bg-green-50 text-green-700 ring-green-600/20",
    absent: "bg-red-50 text-red-700 ring-red-600/20",
    late: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    present: <CheckCircle className="h-3 w-3" />,
    absent: <XCircle className="h-3 w-3" />,
    late: <Clock className="h-3 w-3" />,
  };

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
          {toast.type === "success" ? <CheckCircleSolid className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr('admin.attendanceTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{total} {tr('admin.attendanceSubtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={tr('admin.attendanceRate')} value={`${rate}%`} change={total > 0 ? `${total} ${tr('common.total')}` : "No data"} icon={Calendar} color="blue" />
        <StatCard title={tr('common.present')} value={presentCount.toString()} change={total > 0 ? `${((presentCount / total) * 100).toFixed(0)}%` : "0%"} icon={CheckCircleSolid} color="green" />
        <StatCard title={tr('common.absent')} value={absentCount.toString()} change={total > 0 ? `${((absentCount / total) * 100).toFixed(0)}%` : "0%"} icon={XCircle} color="orange" />
        <StatCard title={tr('common.late')} value={lateCount.toString()} change={total > 0 ? `${((lateCount / total) * 100).toFixed(0)}%` : "0%"} icon={Clock} color="purple" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={tr('common.searchAttendance')}
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">{tr('common.allStatus')}</option>
          <option value="present">{tr('common.present')}</option>
          <option value="absent">{tr('common.absent')}</option>
          <option value="late">{tr('common.late')}</option>
        </select>
        <button
          onClick={() => {
            setForm({ studentId: "", classId: "", date: new Date().toISOString().split("T")[0], status: "present" });
            setAddOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {tr('common.addRecord')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
        </div>
      ) : attendance.length === 0 ? (
        <EmptyState icon={Calendar} title={tr('common.noAttendance')} description="Click 'Add Record' to mark the first attendance entry." />
      ) : (
        <DataTable
          data={filtered}
          keyField="id"
          columns={[
            {
              key: "student",
              label: tr('admin.studentsTitle'),
              render: (a) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    {a.student?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{a.student?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{a.class?.name || ""}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "date",
              label: tr('common.date'),
              render: (a) => (
                <span className="text-gray-700">{new Date(String(a.date)).toLocaleDateString()}</span>
              ),
            },
            {
              key: "status",
              label: tr('common.status'),
              render: (a) => (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[a.status] || ""}`}>
                  {statusIcons[a.status]}
                  {tr('common.' + a.status)}
                </span>
              ),
            },
            {
              key: "actions",
              label: "",
              className: "text-right",
              render: (a) => (
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title={tr('common.edit')}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => openDelete(a)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors" title={tr('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={tr('admin.markAttendance')} size="md">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.date')} <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.status')} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {["present", "absent", "late"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: s }))}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.status === s
                      ? s === "present"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : s === "absent"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s === "present" ? <CheckCircle className="h-4 w-4" /> : s === "absent" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  {tr('common.' + s)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              {tr('common.addRecord')}
            </button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              {tr('common.cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={tr('common.edit') + " " + tr('admin.attendanceTitle')} size="md">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.date')}</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('common.status')}</label>
            <div className="grid grid-cols-3 gap-2">
              {["present", "absent", "late"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: s }))}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.status === s
                      ? s === "present"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : s === "absent"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s === "present" ? <CheckCircle className="h-4 w-4" /> : s === "absent" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  {tr('common.' + s)}
                </button>
              ))}
            </div>
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
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={tr('common.delete') + " " + tr('common.record_one')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{tr('common.confirmDelete')}? {tr('common.cannotUndo')}</p>
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
