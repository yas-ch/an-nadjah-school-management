"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import {
  Calendar, Plus, Pencil, Trash2, CheckCircle, XCircle, Clock,
  CheckCircle as CheckCircleSolid, AlertTriangle, Users, Filter, Search, X,
  Gavel, FileText, BookOpen,
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import Modal from "@/components/admin/Modal";

interface TeacherClass { id: string; name: string }
interface AttendanceItem {
  id: string; studentId: string; classId: string; date: string | Date; status: string;
  time?: string | null; subject?: string | null; justified?: boolean | null; notes?: string | null;
  student?: { id: string; name: string } | null; class?: { id: string; name: string; teacher?: { name: string } } | null
}
interface StudentItem { id: string; name: string }
interface Props { classes: TeacherClass[]; attendance: AttendanceItem[]; students: StudentItem[] }

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function TeacherAttendanceManager({ classes, attendance: initialData, students }: Props) {
  const { t } = useI18n();
  const [attendance, setAttendance] = useState<AttendanceItem[]>(initialData);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AttendanceItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ studentId: "", classId: "", date: "", time: "", subject: "", status: "present", justified: false, notes: "" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClassId) params.set("classId", selectedClassId);
      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();
      setAttendance(data.attendance || []);
    } catch { showToast("Failed to fetch attendance", "error"); }
    finally { setLoading(false); }
  }, [selectedClassId, showToast]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      showToast("Attendance record added");
      setAddOpen(false);
      setForm({ studentId: "", classId: "", date: "", time: "", subject: "", status: "present", justified: false, notes: "" });
      await fetchAttendance();
    } catch { showToast("Failed to add", "error"); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const res = await fetch("/api/attendance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, ...form }) });
      if (!res.ok) throw new Error();
      showToast("Attendance updated");
      setEditOpen(false); setSelected(null);
      await fetchAttendance();
    } catch { showToast("Failed to update", "error"); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch("/api/attendance", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id }) });
      if (!res.ok) throw new Error();
      showToast("Attendance deleted");
      setDeleteOpen(false); setSelected(null);
      await fetchAttendance();
    } catch { showToast("Failed to delete", "error"); }
  };

  const filtered = selectedClassId ? attendance.filter((a) => a.classId === selectedClassId) : attendance;
  const totalPresent = filtered.filter((a) => a.status === "present").length;
  const totalAbsent = filtered.filter((a) => a.status === "absent").length;
  const totalLate = filtered.filter((a) => a.status === "late").length;
  const totalJustified = filtered.filter((a) => a.justified).length;

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; ring: string }> = {
    present: { icon: <CheckCircle className="h-3 w-3" />, color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-600/20" },
    absent: { icon: <XCircle className="h-3 w-3" />, color: "text-red-700", bg: "bg-red-50", ring: "ring-red-600/20" },
    late: { icon: <Clock className="h-3 w-3" />, color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-600/20" },
  };

  return (
    <motion.div className="space-y-6 pb-10" variants={container} initial="hidden" animate="visible">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-xl border ${
              toast.type === "success" ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/50" : "bg-red-50/90 text-red-800 border-red-200/50"
            }`}>
            {toast.type === "success" ? <CheckCircleSolid className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('teacher.attendanceTitle')}</h1>
              <p className="text-amber-100 text-sm">{t('admin.markAttendance')}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setForm({ studentId: "", classId: selectedClassId || "", date: new Date().toISOString().split("T")[0], time: "", subject: "", status: "present", justified: false, notes: "" }); setAddOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/30 hover:bg-white/30 transition-all">
            <Plus className="h-4 w-4" /> {t('admin.markAttendance')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        {[
          { label: t('common.present'), count: totalPresent, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", icon: CheckCircle },
          { label: t('common.absent'), count: totalAbsent, gradient: "from-red-500 to-rose-500", bg: "bg-red-50", icon: XCircle },
          { label: t('common.late'), count: totalLate, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", icon: Clock },
          { label: "Justified", count: totalJustified, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", icon: Gavel },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg shadow-gray-200/40 border border-gray-100">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all appearance-none cursor-pointer">
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
            <div className="absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-amber-500/10" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp}>
          <EmptyState icon={Calendar} title={t('common.noAttendance')} description={t('admin.markAttendance')} />
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/30">
          <DataTable
            data={filtered}
            keyField="id"
            columns={[
              {
                key: "student", label: t('common.name'),
                render: (a) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-xs font-semibold text-amber-700 shadow-sm ring-2 ring-white">
                      {a.student?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium text-gray-900">{a.student?.name || "Unknown"}</span>
                  </div>
                ),
              },
              {
                key: "date", label: t('common.date'),
                render: (a) => (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {new Date(String(a.date)).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "time", label: "Time",
                render: (a) => <span className="text-sm text-gray-600">{a.time || "—"}</span>,
              },
              {
                key: "subject", label: t('admin.subject'),
                render: (a) => <span className="text-sm text-gray-600">{a.subject || "—"}</span>,
              },
              {
                key: "status", label: t('common.status'),
                render: (a) => {
                  const cfg = statusConfig[a.status] || statusConfig.present;
                  return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${cfg.bg} ${cfg.color} ${cfg.ring}`}>
                      {cfg.icon}
                      {a.status === 'present' ? t('common.present') : a.status === 'absent' ? t('common.absent') : t('common.late')}
                    </span>
                  );
                },
              },
              {
                key: "justified", label: "Justified",
                render: (a) => (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${a.justified ? "bg-blue-100 text-blue-700 ring-blue-600/20" : "bg-gray-100 text-gray-600 ring-gray-400/20"}`}>
                    <Gavel className="h-3 w-3" />
                    {a.justified ? "Yes" : "No"}
                  </span>
                ),
              },
              {
                key: "notes", label: t('common.notes'),
                render: (a) => <span className="text-sm text-gray-500 max-w-[120px] truncate block">{a.notes || "—"}</span>,
              },
              {
                key: "actions", label: "", className: "text-right",
                render: (a) => (
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setSelected(a); setForm({ studentId: a.studentId, classId: a.classId, date: new Date(String(a.date)).toISOString().split("T")[0], time: a.time || "", subject: a.subject || "", status: a.status, justified: a.justified || false, notes: a.notes || "" }); setEditOpen(true); }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all" title={t('common.edit')}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setSelected(a); setDeleteOpen(true); }}
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
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('admin.markAttendance')} size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')} <span className="text-red-400">*</span></label>
              <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                <option value="">{t('common.selectClass')}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.studentTitle')} <span className="text-red-400">*</span></label>
              <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                <option value="">{t('common.selectStudent')}</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.date')} <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.subject')}</label>
            <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" placeholder={t('admin.subject')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.status')} <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {["present", "absent", "late"].map((s) => {
                const active = form.status === s;
                const colors = s === "present"
                  ? active ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:border-emerald-200"
                  : s === "absent"
                  ? active ? "border-red-500 bg-red-50 text-red-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:border-red-200"
                  : active ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:border-amber-200";
                return (
                  <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, status: s }))}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${colors}`}>
                    {s === "present" ? <CheckCircle className="h-4 w-4" /> : s === "absent" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {s === 'present' ? t('common.present') : s === 'absent' ? t('common.absent') : t('common.late')}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button type="button" onClick={() => setForm((p) => ({ ...p, justified: !p.justified }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.justified ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                {form.justified && <CheckCircleSolid className="h-3.5 w-3.5 text-white" />}
              </button>
              <span className="text-sm font-medium text-gray-700">Justified Absence</span>
            </label>
            <Gavel className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.notes')}</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" placeholder="Optional notes..." />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all">{t('common.addRecord')}</button>
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setSelected(null); }} title={t('common.edit') + ' ' + t('teacher.attendanceTitle')} size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.classTitle')}</label>
              <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('teacher.studentTitle')}</label>
              <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.date')}</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.subject')}</label>
            <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.status')}</label>
            <div className="grid grid-cols-3 gap-2">
              {["present", "absent", "late"].map((s) => {
                const active = form.status === s;
                const colors = s === "present"
                  ? active ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-emerald-50"
                  : s === "absent"
                  ? active ? "border-red-500 bg-red-50 text-red-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-red-50"
                  : active ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-amber-50";
                return (
                  <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, status: s }))}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${colors}`}>
                    {s === "present" ? <CheckCircle className="h-4 w-4" /> : s === "absent" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {s === 'present' ? t('common.present') : s === 'absent' ? t('common.absent') : t('common.late')}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button type="button" onClick={() => setForm((p) => ({ ...p, justified: !p.justified }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.justified ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                {form.justified && <CheckCircleSolid className="h-3.5 w-3.5 text-white" />}
              </button>
              <span className="text-sm font-medium text-gray-700">Justified Absence</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.notes')}</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" placeholder="Optional notes..." />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all">{t('common.saveChanges')}</button>
            <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">{t('common.cancel')}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelected(null); }} title={t('common.delete') + ' ' + t('common.record_one')} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{t('common.confirmDelete')} {t('teacher.attendanceTitle').toLowerCase()} {t('common.record_one')}? {t('common.cannotUndo')}</p>
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