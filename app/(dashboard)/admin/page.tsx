import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import AdminOverviewClient from "./overview-client";

export default async function AdminOverview() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [
    studentCount,
    teacherCount,
    classCount,
    gradeCount,
    recentStudents,
    recentGrades,
    presentCount,
    totalAttendance,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.class.count(),
    prisma.grade.count(),
    prisma.user.findMany({
      where: { role: "student" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.grade.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        student: { select: { name: true } },
        class: { select: { name: true } },
      },
    }),
    prisma.attendance.count({ where: { status: "present" } }),
    prisma.attendance.count(),
  ]);

  const attendanceRate =
    totalAttendance > 0
      ? ((presentCount / totalAttendance) * 100).toFixed(1)
      : "0";

  return (
    <AdminOverviewClient
      user={{ name: user.name }}
      stats={{
        studentCount,
        teacherCount,
        classCount,
        gradeCount,
        attendanceRate,
        totalAttendance,
      }}
      recentStudents={recentStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        createdAt: String(s.createdAt),
      }))}
      recentGrades={recentGrades.map((g) => ({
        id: g.id,
        studentName: g.student.name,
        subject: g.subject,
        className: g.class.name,
        score: g.score,
        grade: g.grade,
      }))}
    />
  );
}
