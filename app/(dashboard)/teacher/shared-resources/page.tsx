import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherResourcesManager from "@/components/teacher/TeacherResourcesManager";

export default async function TeacherSharedResources() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const resources = await prisma.resource.findMany({
    where: { teacherId: user.id },
    include: { class: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  return <TeacherResourcesManager resources={resources} classes={classes} />;
}
