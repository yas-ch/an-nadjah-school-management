import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ClassesManager from "@/components/admin/ClassesManager";

export default async function AdminClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { grades: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "teacher" },
      select: { id: true, name: true },
    }),
  ]);

  return <ClassesManager initialData={classes} teachers={teachers} />;
}
