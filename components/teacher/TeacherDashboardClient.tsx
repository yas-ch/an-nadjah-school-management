"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import {
  BookOpen, Users, Calendar, ArrowRight, CheckCircle, XCircle, Clock,
  Plus, Save, Paperclip, BarChart3, Download, Youtube, File,
  Link as LinkIcon, Trash2, StickyNote, ClipboardList, TrendingUp,
  Search, Pencil, UserPlus, UserX, Filter, GraduationCap, Activity,
  Shield, Bell, ChevronDown, Sparkles, Home, Grid3X3, List,
  Eye, EyeOff, RefreshCw, ExternalLink, Copy, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface TClass { id: string; name: string; section: string }
interface Student { id: string; name: string; email?: string }
interface Grade {
  id: string; studentId: string; classId: string; subject: string;
  score: number; grade: string; createdAt: string;
  student?: { id: string; name: string }; class?: { id: string; name: string }
}
interface Note { id: string; text: string; type: "class" | "student" | "behavior"; studentName?: string; createdAt: string }
interface Resource { id: string; title: string; type: "pdf" | "youtube" | "link"; url: string; createdAt: string }
interface AttendRec { id: string; studentId: string; classId?: string; status: "present" | "absent" | "late"; date: string; student?: { name: string } }

interface Props {
  user: { name: string };
  classes: TClass[];
  totalStudents: number;
  gradeCount: number;
  students: Student[];
  grades: Grade[];
}

// ─── Animations ───────────────────────────────────────────────────────────
const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } } };
const slideUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const rowAnim = { hidden: { opacity: 0, x: -12 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, type: "spring", stiffness: 300, damping: 28 } }) };

// ─── Helpers ──────────────────────────────────────────────────────────────
const nowISO = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).substr(2, 9);
const gradeColor = (g: string) =>
  g === "A+" || g === "A" ? "text-emerald-600 bg-emerald-50" : g.startsWith("B") ? "text-blue-600 bg-blue-50"
  : g.startsWith("C") ? "text-amber-600 bg-amber-50" : g.startsWith("D") ? "text-orange-600 bg-orange-50"
  : "text-red-600 bg-red-50";
const computeLetter = (s: number) => s >= 18 ? "A+" : s >= 16 ? "A" : s >= 14 ? "B" : s >= 12 ? "C" : s >= 10 ? "D" : "F";

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "French", "History", "Geography", "Philosophy", "Computer Science"];

// ─── Main Component ──────────────────────────────────────────────────────
export default function TeacherDashboardClient({ user, classes: initClasses, students: initStudents, grades: initGrades }: Props) {
  const { t } = useI18n();

  // ── Core State ──
  const [classes, setClasses] = useState<TClass[]>(initClasses);
  const [students, setStudents] = useState<Student[]>(initStudents);
  const [grades, setGrades] = useState<Grade[]>(initGrades);
  const [attendance, setAttendance] = useState<AttendRec[]>([]);

  // ── Notes & Resources ──
  const [notes, setNotes] = useState<Note[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [noteLoading, setNoteLoading] = useState(false);
  const [resLoading, setResLoading] = useState(false);

  // ── UI State ──
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Students ──
  const [studentSearch, setStudentSearch] = useState("");
  const [studentView, setStudentView] = useState<"table" | "cards">("table");
  const [studentModal, setStudentModal] = useState<{ open: boolean; mode: "add" | "edit"; id?: string }>({ open: false, mode: "add" });
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [sForm, setSForm] = useState({ name: "", email: "" });

  const openAddStudent = () => { setSForm({ name: "", email: "" }); setStudentModal({ open: true, mode: "add" }); };
  const openEditStudent = (s: Student) => { setSForm({ name: s.name, email: s.email || "" }); setStudentModal({ open: true, mode: "edit", id: s.id }); };

  const saveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentModal.mode === "add") {
      const newStudent: Student = { id: uid(), name: sForm.name, email: sForm.email };
      setStudents((p) => [...p, newStudent]);
      showToast("✓ Student added");
    } else {
      setStudents((p) => p.map((s) => s.id === studentModal.id ? { ...s, name: sForm.name, email: sForm.email } : s));
      showToast("✓ Student updated");
    }
    setStudentModal({ open: false, mode: "add" });
  };

  const confirmDeleteStudent = () => {
    if (!deleteStudentId) return;
    setStudents((p) => p.filter((s) => s.id !== deleteStudentId));
    showToast("✓ Student removed");
    setDeleteStudentId(null);
  };

  const filteredStudents = useMemo(() =>
    students.filter((s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
    ), [students, studentSearch]);

  // ── Classes ──
  const [classModal, setClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: "", section: "" });

  const createClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;
    const newClass: TClass = { id: uid(), name: classForm.name, section: classForm.section };
    setClasses((p) => [...p, newClass]);
    setClassForm({ name: "", section: "" });
    setClassModal(false);
    showToast("✓ Class created");
  };

  // ── Attendance ──
  const [attClassId, setAttClassId] = useState(classes[0]?.id || "");
  const [attRecs, setAttRecs] = useState<Record<string, string>>({});
  const [attHistory, setAttHistory] = useState<AttendRec[]>([]);
  const [showAttHistory, setShowAttHistory] = useState(false);

  const initAtt = useCallback(() => {
    const r: Record<string, string> = {};
    students.forEach((s) => (r[s.id] = "present"));
    setAttRecs(r);
  }, [students]);
  useEffect(() => { if (Object.keys(attRecs).length === 0 && students.length) initAtt(); }, [students, attRecs, initAtt]);

  const saveAttendance = () => {
    const date = todayStr();
    const newRecs: AttendRec[] = Object.entries(attRecs).map(([studentId, status]) => ({
      id: uid(), studentId, classId: attClassId, status: status as "present" | "absent" | "late", date,
      student: students.find((s) => s.id === studentId),
    }));
    setAttendance((p) => [...newRecs, ...p]);
    setAttHistory((p) => [...newRecs, ...p]);
    showToast(`✓ ${Object.keys(attRecs).length} attendance records saved`);
  };

  // ── Grades ──
  const [gForm, setGForm] = useState({ studentId: "", classId: classes[0]?.id || "", subject: subjects[0], score: "" });
  const [editGradeId, setEditGradeId] = useState<string | null>(null);
  const [deleteGradeId, setDeleteGradeId] = useState<string | null>(null);

  const addGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseFloat(gForm.score);
    if (isNaN(score)) return;
    const newGrade: Grade = {
      id: uid(), studentId: gForm.studentId, classId: gForm.classId,
      subject: gForm.subject, score, grade: computeLetter(score), createdAt: nowISO(),
      student: students.find((s) => s.id === gForm.studentId),
      class: classes.find((c) => c.id === gForm.classId),
    };
    setGrades((p) => [newGrade, ...p]);
    setGForm((p) => ({ ...p, score: "" }));
    showToast("✓ Grade added");
  };

  const updateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGradeId) return;
    const score = parseFloat(gForm.score);
    if (isNaN(score)) return;
    setGrades((p) => p.map((g) => g.id === editGradeId ? {
      ...g, studentId: gForm.studentId, classId: gForm.classId,
      subject: gForm.subject, score, grade: computeLetter(score),
      student: students.find((s) => s.id === gForm.studentId),
      class: classes.find((c) => c.id === gForm.classId),
    } : g));
    setEditGradeId(null);
    showToast("✓ Grade updated");
  };

  const openEditGrade = (g: Grade) => {
    setGForm({ studentId: g.studentId, classId: g.classId, subject: g.subject, score: String(g.score) });
    setEditGradeId(g.id);
  };

  const confirmDeleteGrade = () => {
    if (!deleteGradeId) return;
    setGrades((p) => p.filter((g) => g.id !== deleteGradeId));
    setDeleteGradeId(null);
    showToast("✓ Grade deleted");
  };

  // ── Notes ──
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<"class" | "student" | "behavior">("class");
  const [noteStudent, setNoteStudent] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const addNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch("/api/shared-notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText, type: noteType, studentId: noteType !== "class" ? noteStudent || undefined : undefined }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      const newNote: Note = {
        id: d.note.id, text: d.note.content, type: noteType,
        studentName: noteType !== "class" ? noteStudent || undefined : undefined,
        createdAt: d.note.createdAt,
      };
      setNotes((p) => [newNote, ...p]);
      setNoteText("");
      showToast("✓ Note saved");
    } catch {
      showToast("Failed to save note", "error");
    } finally {
      setNoteLoading(false);
    }
  };

  const delNote = async (id: string) => {
    try {
      const res = await fetch("/api/shared-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setNotes((p) => p.filter((n) => n.id !== id));
      showToast("✓ Note removed");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const filteredNotes = useMemo(() =>
    notes.filter((n) =>
      n.text.toLowerCase().includes(noteSearch.toLowerCase()) ||
      (n.studentName && n.studentName.toLowerCase().includes(noteSearch.toLowerCase()))
    ), [notes, noteSearch]);

  // ── Resources ──
  const [resForm, setResForm] = useState({ title: "", type: "pdf" as Resource["type"], url: "" });

  const addResource = async () => {
    if (!resForm.title.trim() || !resForm.url.trim()) return;
    setResLoading(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resForm),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      const newRes: Resource = { id: d.resource.id, title: d.resource.title, type: d.resource.type, url: d.resource.url, createdAt: d.resource.createdAt };
      setResources((p) => [newRes, ...p]);
      setResForm({ title: "", type: "pdf", url: "" });
      showToast("✓ Resource added");
    } catch {
      showToast("Failed to add resource", "error");
    } finally {
      setResLoading(false);
    }
  };

  const delResource = async (id: string) => {
    try {
      const res = await fetch("/api/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error();
      setResources((p) => p.filter((r) => r.id !== id));
      showToast("✓ Resource removed");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  // ── Derived Stats ──
  const avgGrade = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : null;
  const passRate = grades.length ? ((grades.filter((g) => g.score >= 10).length / grades.length) * 100).toFixed(0) : null;
  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const totalAbsent = attendance.filter((a) => a.status === "absent").length;
  const totalLate = attendance.filter((a) => a.status === "late").length;
  const attRate = attendance.length ? ((totalPresent / attendance.length) * 100).toFixed(0) : null;

  // ── Resource icons ──
  const resIcons: Record<string, React.ReactNode> = {
    pdf: <File className="h-5 w-5 text-rose-500" />,
    youtube: <Youtube className="h-5 w-5 text-red-500" />,
    link: <LinkIcon className="h-5 w-5 text-blue-500" />,
  };

  return (
    <motion.div className="space-y-8 pb-12" variants={container} initial="hidden" animate="visible">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/50"
                : "bg-red-50/90 text-red-800 border-red-200/50"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ HEADER ═══════════ */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-white/30">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('common.welcomeBack')}{user.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-1.5 text-primary-100/80 text-sm flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2.5 rounded-xl bg-white/15 backdrop-blur-xl px-5 py-3 text-white shadow-lg ring-1 ring-white/20">
              <BookOpen className="h-4 w-4 text-primary-200" />
              <span className="font-semibold text-sm">{classes.length}</span>
              <span className="text-primary-200/80 text-xs">{classes.length !== 1 ? t('common.class_other') : t('common.class_one')}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2.5 rounded-xl bg-white/15 backdrop-blur-xl px-5 py-3 text-white shadow-lg ring-1 ring-white/20">
              <Users className="h-4 w-4 text-primary-200" />
              <span className="font-semibold text-sm">{students.length}</span>
              <span className="text-primary-200/80 text-xs">{students.length !== 1 ? t('common.student_other') : t('common.student_one')}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2.5 rounded-xl bg-white/15 backdrop-blur-xl px-5 py-3 text-white shadow-lg ring-1 ring-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="font-semibold text-sm">{grades.length}</span>
              <span className="text-primary-200/80 text-xs">{t('common.grade_other')}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ STATS ROW ═══════════ */}
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('teacher.myClasses'), value: String(classes.length), sub: t('common.thisSemester'), icon: BookOpen, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
          { label: t('teacher.totalStudents'), value: String(students.length), sub: `${students.length} ${t('common.enrolled')}`, icon: Users, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
          { label: t('teacher.totalGrades'), value: String(grades.length), sub: `${grades.length} ${t('common.record_other')}`, icon: ClipboardList, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
          { label: t('teacher.avgClassScore'), value: avgGrade ? `${avgGrade}/20` : "—", sub: passRate ? `${passRate}% ${t('common.records')}` : t('common.noData'), icon: TrendingUp, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i} variants={rowAnim}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.gradient}`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1.5">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-5 w-5 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.div>
        ))}
      </motion.div>

      {/* ═══════════ STUDENT MANAGEMENT ═══════════ */}
      <motion.div variants={fadeUp}>
        <PremiumSection
          icon={Users} gradient="from-blue-500 to-indigo-600"
          title={t('admin.studentsTitle')}
          subtitle={t('common.add') + ', ' + t('common.edit') + ', ' + t('common.remove') + ' — ' + t('common.search')}
          action={
            <div className="flex items-center gap-2">
              <button onClick={() => setStudentView(studentView === "table" ? "cards" : "table")}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                {studentView === "table" ? <Grid3X3 className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {studentView === "table" ? t('common.cards') : t('common.table')}
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={openAddStudent}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                <UserPlus className="h-4 w-4" /> {t('common.addStudent')}
              </motion.button>
            </div>
          }
        >
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder={t('common.searchStudents')}
              value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
            />
            {studentSearch && (
              <button onClick={() => setStudentSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">{studentSearch ? "No students match your search" : t('common.noStudents')}</p>
            </div>
          ) : studentView === "table" ? (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                      {[t('common.name'), t('common.email'), t('common.status'), ''].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((s, i) => (
                      <motion.tr key={s.id} custom={i} variants={rowAnim} initial="hidden" animate="visible"
                        className="hover:bg-blue-50/30 transition-colors group/item">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-sm font-semibold text-blue-700 shadow-sm ring-2 ring-white">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">{s.email || <span className="text-gray-300 italic">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {t('common.active')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <IconBtn icon={Pencil} label={t('common.edit')} onClick={() => openEditStudent(s)} />
                            <IconBtn icon={Trash2} label={t('common.remove')} onClick={() => setDeleteStudentId(s.id)} className="hover:bg-red-50 hover:text-red-600" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-2.5 flex items-center justify-between">
                <p className="text-xs text-gray-400">{filteredStudents.length} / {students.length} {t('common.student_other')}</p>
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].slice(0, 5).map((l) => (
                    <button key={l} onClick={() => setStudentSearch(l.toLowerCase())}
                      className="h-6 w-6 rounded-md text-xs font-medium text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((s, i) => (
                <motion.div key={s.id} custom={i} variants={rowAnim}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-lg font-bold text-white shadow-md">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.email || t('common.noData')}</p>
                      </div>
                    </div>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                    <button onClick={() => openEditStudent(s)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                    </button>
                    <button onClick={() => setDeleteStudentId(s.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2 text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                      <Trash2 className="h-3.5 w-3.5" /> {t('common.remove')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PremiumSection>
      </motion.div>

      {/* ═══════════ MY CLASSES + QUICK CREATE ═══════════ */}
      <motion.div variants={fadeUp}>
        <PremiumSection
          icon={BookOpen} gradient="from-emerald-500 to-teal-600"
          title={t('teacher.myClasses')}
          subtitle={`${classes.length} ${classes.length !== 1 ? t('common.class_other') : t('common.class_one')}`}
          action={
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setClassModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
              <Plus className="h-4 w-4" /> {t('common.addClass')}
            </motion.button>
          }
        >
          {classes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">{t('common.noClasses')}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {classes.map((cls, i) => {
                const classStudents = students.length;
                const gradeCount = grades.filter((g) => g.classId === cls.id).length;
                const attCount = attendance.filter((a) => a.classId === cls.id).length;
                const gradients = [
                  "from-blue-400 to-indigo-500", "from-emerald-400 to-teal-500", "from-violet-400 to-purple-500",
                  "from-amber-400 to-orange-500", "from-rose-400 to-pink-500", "from-cyan-400 to-blue-500",
                ];
                const g = gradients[i % gradients.length];
                return (
                  <motion.div key={cls.id} custom={i} variants={rowAnim}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${g}`} />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/10">
                        {t('common.active')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${g} text-white shadow-lg`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{cls.name}</p>
                        <p className="text-xs text-gray-500">{cls.section || t('common.unassigned')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-50">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{classStudents}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('common.student_other')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{gradeCount}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('common.grade_other')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{attCount}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('common.records')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGForm((p) => ({ ...p, classId: cls.id }))}
                        className="flex-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all active:scale-95">
                        {t('common.addGrade')}
                      </button>
                      <button
                        onClick={() => { setAttClassId(cls.id); setShowAttHistory(false); }}
                        className="flex-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-xs font-medium text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-all active:scale-95">
                        {t('common.present')}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </PremiumSection>
      </motion.div>

      {/* ═══════════ ATTENDANCE + GRADES SIDE BY SIDE ═══════════ */}
      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
        {/* ATTENDANCE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('teacher.attendanceTitle')}</h3>
                <p className="text-xs text-gray-500">{t('admin.markAttendance')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={attClassId} onChange={(e) => setAttClassId(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all">
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={saveAttendance}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 px-3.5 py-2 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all">
                <Save className="h-3.5 w-3.5" /> {t('common.save')}
              </motion.button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">{t('common.noStudents')}</p>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {students.slice(0, 15).map((s, i) => (
                <motion.div key={s.id} custom={i} variants={slideUp}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 hover:bg-amber-50/50 transition-colors group/att">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 text-xs font-semibold text-amber-700">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{s.name}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {(["present", "absent", "late"] as const).map((st) => {
                      const active = attRecs[s.id] === st;
                      const colors = {
                        present: active ? "bg-emerald-500 text-white shadow-sm shadow-emerald-300" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                        absent: active ? "bg-red-500 text-white shadow-sm shadow-red-300" : "bg-red-50 text-red-600 hover:bg-red-100",
                        late: active ? "bg-amber-500 text-white shadow-sm shadow-amber-300" : "bg-amber-50 text-amber-600 hover:bg-amber-100",
                      };
                      return (
                        <button key={st} onClick={() => setAttRecs((p) => ({ ...p, [s.id]: st }))}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-90 ${colors[st]}`}>
                          {st === "present" && <CheckCircle className="h-3 w-3" />}
                          {st === "absent" && <XCircle className="h-3 w-3" />}
                          {st === "late" && <Clock className="h-3 w-3" />}
                          <span className="hidden sm:inline">{st === 'present' ? t('common.present') : st === 'absent' ? t('common.absent') : t('common.late')}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {attendance.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('common.present')}: {totalPresent}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> {t('common.absent')}: {totalAbsent}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> {t('common.late')}: {totalLate}</span>
              </div>
            </div>
          )}
        </div>

        {/* GRADES */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-md">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t('teacher.gradesTitle')}</h3>
                <p className="text-xs text-gray-500">{t('common.add')} / {t('common.edit')} / {t('common.remove')}</p>
              </div>
            </div>
            {avgGrade && (
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-xs text-gray-400">{t('admin.averageScore')}</p>
                  <p className="text-lg font-bold text-gray-900">{avgGrade}/20</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Grade Form */}
          <form onSubmit={editGradeId ? updateGrade : addGrade} className="grid grid-cols-5 gap-2 mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-50/50 to-purple-50/50 border border-violet-100">
            <select value={gForm.classId} onChange={(e) => setGForm((p) => ({ ...p, classId: e.target.value }))} required
              className="col-span-1 rounded-lg border border-violet-200 bg-white px-2 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name.slice(0, 6)}</option>)}
            </select>
            <select value={gForm.studentId} onChange={(e) => setGForm((p) => ({ ...p, studentId: e.target.value }))} required
              className="col-span-1 rounded-lg border border-violet-200 bg-white px-2 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all">
              <option value="">{t('common.selectStudent')}</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>)}
            </select>
            <input type="number" min="0" max="20" step="0.5" placeholder="0–20" value={gForm.score}
              onChange={(e) => setGForm((p) => ({ ...p, score: e.target.value }))} required
              className="col-span-1 rounded-lg border border-violet-200 bg-white px-2 py-2 text-xs focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all" />
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="col-span-1 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 px-2 py-2 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all">
              {editGradeId ? t('common.update') : t('common.add')}
            </motion.button>
            {editGradeId && (
              <button type="button" onClick={() => setEditGradeId(null)}
                className="col-span-1 rounded-lg border border-gray-200 px-2 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
                {t('common.cancel')}
              </button>
            )}
          </form>

          {grades.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">{t('common.noGrades')}</p>
          ) : (
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {grades.slice(0, 12).map((g, i) => (
                <motion.div key={g.id} custom={i} variants={slideUp}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 hover:bg-violet-50/40 transition-colors group/grade">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 text-xs font-semibold text-violet-700">
                      {g.student?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{g.student?.name || "Unknown"}</p>
                      <p className="text-[10px] text-gray-400">{g.subject} · {g.class?.name || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{g.score}/20</span>
                      <span className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${gradeColor(g.grade)}`}>{g.grade}</span>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover/grade:opacity-100 transition-opacity">
                      <IconBtn icon={Pencil} label={t('common.edit')} onClick={() => openEditGrade(g)} className="hover:bg-violet-100 hover:text-violet-600" />
                      <IconBtn icon={Trash2} label={t('common.delete')} onClick={() => setDeleteGradeId(g.id)} className="hover:bg-red-100 hover:text-red-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════ 3-COL GRID: NOTES | RESOURCES | ANALYTICS ═══════════ */}
      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-3">

        {/* ── NOTES ── */}
        <div className="group/card relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 to-indigo-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
          <PremiumMiniCard gradient="from-violet-400 to-indigo-500" icon={StickyNote} title={t('teacher.notesTitle')} subtitle={t('teacher.noteClass') + ' / ' + t('teacher.noteStudent')} />

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="text" placeholder={t('common.search')} value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs focus:bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all placeholder:text-gray-400" />
          </div>

          <div className="flex gap-2 mb-2">
            {(["class", "student", "behavior"] as const).map((nt) => (
              <button key={nt} onClick={() => setNoteType(nt)}
                className={`flex-1 rounded-lg py-1.5 text-[10px] font-medium transition-all ${
                  noteType === nt
                    ? nt === "class" ? "bg-blue-100 text-blue-700" : nt === "student" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}>
                {nt === "class" ? t('teacher.noteClass') : nt === "student" ? t('teacher.noteStudent') : t('teacher.noteBehavior')}
              </button>
            ))}
          </div>

          {(noteType === "student" || noteType === "behavior") && (
            <select value={noteStudent} onChange={(e) => setNoteStudent(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all mb-2">
              <option value="">{t('common.selectStudent')}</option>
              {students.filter((_, idx) => idx < 20).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          )}

          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={t('teacher.noteContent')} rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs resize-none bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all placeholder:text-gray-400 mb-2" />

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={addNote} disabled={noteLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white shadow-md transition-all ${
              noteLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-violet-500 to-indigo-600 hover:shadow-lg active:scale-[0.98]"
            }`}>
            <Save className="h-3.5 w-3.5" /> {noteLoading ? "Saving..." : t('common.save')}
          </motion.button>

          {filteredNotes.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {filteredNotes.slice(0, 10).map((n) => {
                const typeColors: Record<string, string> = { class: "border-l-blue-400 bg-blue-50/50", student: "border-l-violet-400 bg-violet-50/50", behavior: "border-l-amber-400 bg-amber-50/50" };
                return (
                  <div key={n.id} className={`group/note flex items-start justify-between rounded-lg border-l-2 ${typeColors[n.type] || "border-l-gray-300"} p-3 hover:shadow-sm transition-all`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-500 mb-0.5">
                        {n.type === "class" ? t('teacher.noteClass') : n.type === "behavior" ? t('teacher.noteBehavior') : t('teacher.noteStudent')}
                        {n.studentName ? ` · ${n.studentName}` : ""}
                      </p>
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{n.text}</p>
                    </div>
                    <button onClick={() => delNote(n.id)}
                      className="shrink-0 ml-2 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/note:opacity-100 transition-all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RESOURCES ── */}
        <div className="group/card relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
          <PremiumMiniCard gradient="from-amber-400 to-orange-500" icon={Paperclip} title={t('teacher.resourcesTitle')} subtitle={t('teacher.resourcePdf')} />

          <div className="space-y-2">
            <input type="text" value={resForm.title} onChange={(e) => setResForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t('teacher.resourceTitle')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-gray-50 focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all placeholder:text-gray-400" />
            <div className="grid grid-cols-3 gap-1.5">
              {(["pdf", "youtube", "link"] as const).map((rtype) => (
                <button key={rtype} onClick={() => setResForm((p) => ({ ...p, type: rtype }))}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-all ${
                    resForm.type === rtype
                      ? rtype === "pdf" ? "bg-rose-100 text-rose-700" : rtype === "youtube" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}>
                  {rtype === "pdf" ? <File className="h-3 w-3" /> : rtype === "youtube" ? <Youtube className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
                  {rtype === "pdf" ? "PDF" : rtype === "youtube" ? "YT" : "URL"}
                </button>
              ))}
            </div>
            <input type="url" value={resForm.url} onChange={(e) => setResForm((p) => ({ ...p, url: e.target.value }))}
              placeholder={t('teacher.resourceUrl')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-gray-50 focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all placeholder:text-gray-400" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={addResource} disabled={resLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white shadow-md transition-all ${
                resLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-amber-500 to-orange-600 hover:shadow-lg"
              }`}>
              <Plus className="h-3.5 w-3.5" /> {resLoading ? "Adding..." : t('teacher.addResource')}
            </motion.button>
          </div>

          {resources.length > 0 && (
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {resources.slice(0, 8).map((r) => (
                <div key={r.id} className="group/res flex items-center justify-between rounded-lg bg-gray-50/80 p-3 hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">{resIcons[r.type]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.url.slice(0, 40)}</p>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 rounded-md p-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover/res:opacity-100 transition-all">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <button onClick={() => delResource(r.id)}
                    className="shrink-0 ml-1.5 rounded-md p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/res:opacity-100 transition-all">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ANALYTICS ── */}
        <div className="group/card relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />
          <PremiumMiniCard gradient="from-rose-400 to-pink-500" icon={BarChart3} title={t('teacher.reportsTitle')} subtitle={t('common.statistics')} />

          {/* Grade Distribution Bars */}
          {grades.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{t('admin.gradeDistribution')}</p>
              <div className="space-y-2">
                {(() => {
                  const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
                  grades.forEach((g) => { const l = g.grade.charAt(0); if (dist[l] !== undefined) dist[l]++; });
                  const max = Math.max(...Object.values(dist), 1);
                  const colors: Record<string, string> = { A: "bg-emerald-500", B: "bg-blue-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500" };
                  return Object.entries(dist).map(([letter, count]) => (
                    <div key={letter} className="flex items-center gap-2.5">
                      <span className="w-4 text-[10px] font-bold text-gray-500">{letter}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / max) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${colors[letter]} transition-all`}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] font-medium text-gray-500">{count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Attendance Overview */}
          {attendance.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{t('admin.attendanceOverviewTitle')}</p>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${attendance.length ? (totalPresent / attendance.length) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full transition-all" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${attendance.length ? (totalAbsent / attendance.length) * 100 : 0}%` }}
                  className="bg-red-500 h-full transition-all" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${attendance.length ? (totalLate / attendance.length) * 100 : 0}%` }}
                  className="bg-amber-500 h-full transition-all" />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>{t('common.present')}: {attRate || 0}%</span>
                <span>{t('common.absent')}: {attendance.length ? ((totalAbsent / attendance.length) * 100).toFixed(0) : 0}%</span>
                <span>{t('common.late')}: {attendance.length ? ((totalLate / attendance.length) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{t('admin.quickActions')}</p>
          <div className="space-y-1.5">
            {[
              { icon: Download, label: t('common.reports'), sub: t('teacher.attendanceTitle'), color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
              { icon: BarChart3, label: t('common.statistics'), sub: t('teacher.gradesTitle'), color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
              { icon: Users, label: t('teacher.studentTitle'), sub: t('common.reports'), color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
            ].map((item) => (
              <motion.button key={item.label} whileHover={{ x: 4 }}
                className="group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.color} transition-colors`}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-xs">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </motion.button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/60 p-3">
              <p className="text-[10px] text-gray-500 mb-0.5">{t('admin.averageScore')}</p>
              <p className="text-lg font-bold text-gray-900">{avgGrade || "—"}/20</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${avgGrade ? (parseFloat(avgGrade) / 20) * 100 : 0}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/60 p-3">
              <p className="text-[10px] text-gray-500 mb-0.5">{t('common.records')}</p>
              <p className="text-lg font-bold text-emerald-600">{passRate || "—"}%</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${passRate || 0}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ ALL MODALS ═══════════ */}

      {/* ── Add/Edit Student Modal ── */}
      <AnimatePresence>
        {studentModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setStudentModal({ open: false, mode: "add" })}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-black/10">
              <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-blue-400 to-indigo-500" />
              <button onClick={() => setStudentModal({ open: false, mode: "add" })} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{studentModal.mode === "add" ? t('common.addStudent') : t('common.editStudent')}</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in the student details below</p>
              <form onSubmit={saveStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.name')} <span className="text-red-400">*</span></label>
                  <input type="text" value={sForm.name} onChange={(e) => setSForm((p) => ({ ...p, name: e.target.value }))} required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.email')} <span className="text-red-400">*</span></label>
                  <input type="email" value={sForm.email} onChange={(e) => setSForm((p) => ({ ...p, email: e.target.value }))} required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all">
                    {studentModal.mode === "add" ? t('common.addStudent') : t('common.saveChanges')}
                  </motion.button>
                  <button type="button" onClick={() => setStudentModal({ open: false, mode: "add" })}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Student Confirmation ── */}
      <AnimatePresence>
        {deleteStudentId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteStudentId(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-black/10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 text-center mb-1">{t('common.deleteStudent')}</h2>
              <p className="text-sm text-gray-500 text-center mb-6">{t('common.confirmDelete')} {t('common.student_one')}? {t('common.cannotUndo')}</p>
              <div className="flex items-center gap-3">
                <motion.button onClick={confirmDeleteStudent} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/25 hover:shadow-xl transition-all">
                  {t('common.remove')}
                </motion.button>
                <button onClick={() => setDeleteStudentId(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Class Modal ── */}
      <AnimatePresence>
        {classModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setClassModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-black/10">
              <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-emerald-400 to-teal-500" />
              <button onClick={() => setClassModal(false)} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t('common.addClass')}</h2>
              <p className="text-sm text-gray-500 mb-6">Create a new class section</p>
              <form onSubmit={createClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.name')} <span className="text-red-400">*</span></label>
                  <input type="text" value={classForm.name} onChange={(e) => setClassForm((p) => ({ ...p, name: e.target.value }))} required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin.section')}</label>
                  <input type="text" value={classForm.section} onChange={(e) => setClassForm((p) => ({ ...p, section: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all">
                    {t('common.create')}
                  </motion.button>
                  <button type="button" onClick={() => setClassModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Grade Confirmation ── */}
      <AnimatePresence>
        {deleteGradeId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteGradeId(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-black/10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 text-center mb-1">{t('common.deleteGrade')}</h2>
              <p className="text-sm text-gray-500 text-center mb-6">{t('common.confirmDelete')} {t('common.grade_one')}? {t('common.cannotUndo')}</p>
              <div className="flex items-center gap-3">
                <motion.button onClick={confirmDeleteGrade} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/25 hover:shadow-xl transition-all">
                  {t('common.delete')}
                </motion.button>
                <button onClick={() => setDeleteGradeId(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────
function PremiumSection({ icon: Icon, gradient, title, subtitle, action, children }: {
  icon: React.ComponentType<{ className?: string }>; gradient: string; title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="group/prem relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/30 hover:shadow-xl transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function PremiumMiniCard({ gradient, icon: Icon, title, subtitle }: {
  gradient: string; icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick, className }: {
  icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; className?: string;
}) {
  return (
    <button onClick={onClick} title={label}
      className={`rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all ${className || ""}`}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
