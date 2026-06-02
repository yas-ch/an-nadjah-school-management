import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerResourcesClient from "@/components/viewer/ViewerResourcesClient";

export default async function StudentResources() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const enrolledClasses = await prisma.class.findMany({
    where: {
      OR: [
        { grades: { some: { studentId: user.id } } },
        { attendance: { some: { studentId: user.id } } },
      ],
    },
    select: { id: true },
  });
  const classIds = enrolledClasses.map((c) => c.id);

  const resources = await prisma.resource.findMany({
    where: classIds.length > 0 ? { classId: { in: classIds } } : { id: undefined },
    include: {
      teacher: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ViewerResourcesClient resources={resources} role="student" />;
}
