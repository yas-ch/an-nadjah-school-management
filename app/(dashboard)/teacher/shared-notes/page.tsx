import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherNotesManager from "@/components/teacher/TeacherNotesManager";

export default async function TeacherSharedNotes() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const notes = await prisma.sharedNote.findMany({
    where: { teacherId: user.id },
    include: {
      student: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <TeacherNotesManager notes={notes} students={students} classes={classes} subjects={subjects} />;
}
