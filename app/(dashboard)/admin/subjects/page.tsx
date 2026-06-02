import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import SubjectsManager from "@/components/admin/SubjectsManager";

export default async function AdminSubjects() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [subjects, teachers] = await Promise.all([
    prisma.subject.findMany({
      include: { teacher: { select: { id: true, name: true, email: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "teacher" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <SubjectsManager initialData={subjects} teachers={teachers} />;
}
