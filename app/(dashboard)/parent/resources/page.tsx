import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerResourcesClient from "@/components/viewer/ViewerResourcesClient";

export default async function ParentResources() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true },
  });
  const childIds = children.map((c) => c.id);

  const childClasses = await prisma.class.findMany({
    where: {
      OR: [
        { grades: { some: { studentId: { in: childIds } } } },
        { attendance: { some: { studentId: { in: childIds } } } },
      ],
    },
    select: { id: true },
  });
  const classIds = childClasses.map((c) => c.id);

  const resources = await prisma.resource.findMany({
    where: classIds.length > 0 ? { classId: { in: classIds } } : { id: undefined },
    include: {
      teacher: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ViewerResourcesClient resources={resources} role="parent" />;
}
