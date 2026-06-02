import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherAttendanceManager from "@/components/teacher/AttendanceManager";

export default async function TeacherAttendance() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const [classes, attendance] = await Promise.all([
    prisma.class.findMany({
      where: { teacherId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: { class: { teacherId: user.id } },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, teacher: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
  ]);

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <TeacherAttendanceManager classes={classes} attendance={attendance} students={students} />;
}
