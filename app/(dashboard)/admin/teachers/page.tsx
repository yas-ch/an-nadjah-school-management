import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeachersManager from "@/components/admin/TeachersManager";

export default async function AdminTeachers() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [teachers, classes, subjects] = await Promise.all([
    prisma.user.findMany({
      where: { role: "teacher" },
      include: {
        teacherProfile: true,
        _count: { select: { classes: true, grades: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
  ]);

  return <TeachersManager initialData={teachers} classes={classes} subjects={subjects} />;
}
