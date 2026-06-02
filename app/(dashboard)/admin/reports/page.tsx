import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ReportsDashboard from "@/components/admin/ReportsDashboard";

export default async function AdminReports() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [students, teachers, classes, grades, attendance] = await Promise.all([
    prisma.user.findMany({ where: { role: "student" }, include: { studentProfile: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ where: { role: "teacher" }, include: { teacherProfile: true, _count: { select: { classes: true, grades: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.class.findMany({ include: { teacher: { select: { name: true } }, _count: { select: { grades: true, attendance: true } } }, orderBy: { name: "asc" } }),
    prisma.grade.findMany({ include: { student: { select: { name: true } }, class: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.attendance.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <ReportsDashboard
      students={students.map(s => ({ id: s.id, name: s.name, email: s.email, grade: s.studentProfile?.grade || "—", createdAt: String(s.createdAt) }))}
      teachers={teachers.map(t => ({ id: t.id, name: t.name, email: t.email, department: t.teacherProfile?.department || "—", classCount: t._count.classes, gradeCount: t._count.grades }))}
      classes={classes.map(c => ({ id: c.id, name: c.name, teacher: c.teacher?.name || "—", gradeCount: c._count.grades, attendanceCount: c._count.attendance }))}
      grades={grades.map(g => ({ id: g.id, studentName: g.student.name, subject: g.subject, className: g.class.name, score: g.score, grade: g.grade }))}
      attendance={attendance.map(a => ({ id: a.id, status: a.status, date: String(a.date) }))}
    />
  );
}
