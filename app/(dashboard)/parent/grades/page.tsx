import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerGradesClient from "@/components/viewer/ViewerGradesClient";

export default async function ParentGrades() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true, name: true },
  });
  const childIds = children.map((c) => c.id);

  const grades = await prisma.grade.findMany({
    where: { studentId: { in: childIds } },
    include: {
      class: { select: { name: true } },
      student: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ViewerGradesClient grades={grades} role="parent" />;
}
