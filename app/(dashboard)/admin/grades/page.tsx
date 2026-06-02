import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import GradesManager from "@/components/admin/GradesManager";

export default async function AdminGrades() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [grades, students, classes] = await Promise.all([
    prisma.grade.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <GradesManager initialData={grades} students={students} classes={classes} />;
}
