import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherGradesManager from "@/components/teacher/GradesManager";

export default async function TeacherGrades() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const [classes, grades] = await Promise.all([
    prisma.class.findMany({
      where: { teacherId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({
      where: { class: { teacherId: user.id } },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <TeacherGradesManager classes={classes} grades={grades} students={students} />;
}
