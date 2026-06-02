import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerClassesClient from "@/components/viewer/ViewerClassesClient";

export default async function StudentClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const classes = await prisma.class.findMany({
    where: { grades: { some: { studentId: user.id } } },
    include: { teacher: { select: { id: true, name: true, email: true } } },
    orderBy: { name: "asc" },
  });

  return <ViewerClassesClient classes={classes} role="student" />;
}
