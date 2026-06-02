import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import StudentsManager from "@/components/admin/StudentsManager";

export default async function AdminStudents() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [students, classes] = await Promise.all([
    prisma.user.findMany({
      where: { role: "student" },
      include: {
        studentProfile: true,
        _count: { select: { grades: true, attendance: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <StudentsManager initialData={students} classes={classes} />;
}
