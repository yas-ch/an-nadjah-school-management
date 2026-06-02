import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherDashboardClient from "@/components/teacher/TeacherDashboardClient";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const [classes, studentGroup, gradeCount, grades] = await Promise.all([
    prisma.class.findMany({
      where: { teacherId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.grade.groupBy({
      by: ["studentId"],
      where: { class: { teacherId: user.id } },
    }),
    prisma.grade.count({
      where: { class: { teacherId: user.id } },
    }),
    prisma.grade.findMany({
      where: { class: { teacherId: user.id } },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalStudents = studentGroup.length;

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <TeacherDashboardClient
      user={{ name: user.name }}
      classes={classes.map((c) => ({ id: c.id, name: c.name, section: c.section }))}
      totalStudents={totalStudents}
      gradeCount={gradeCount}
      students={students}
      grades={grades.map((g) => ({
        id: g.id,
        studentId: g.studentId,
        classId: g.classId,
        subject: g.subject,
        score: g.score,
        grade: g.grade,
        createdAt: String(g.createdAt),
        student: g.student,
        class: g.class,
      }))}
    />
  );
}
