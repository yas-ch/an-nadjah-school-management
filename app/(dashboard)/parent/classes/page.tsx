import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerClassesClient from "@/components/viewer/ViewerClassesClient";

export default async function ParentClasses() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true },
  });
  const childIds = children.map((c) => c.id);

  const classes = await prisma.class.findMany({
    where: {
      OR: [
        { grades: { some: { studentId: { in: childIds } } } },
        { attendance: { some: { studentId: { in: childIds } } } },
      ],
    },
    include: { teacher: { select: { id: true, name: true, email: true } } },
    orderBy: { name: "asc" },
  });

  return <ViewerClassesClient classes={classes} role="parent" />;
}
