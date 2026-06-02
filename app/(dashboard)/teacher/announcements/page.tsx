import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import TeacherAnnouncementsManager from "@/components/teacher/TeacherAnnouncementsManager";

export default async function TeacherAnnouncements() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") redirect("/");

  const announcements = await prisma.announcement.findMany({
    where: { teacherId: user.id },
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });

  return <TeacherAnnouncementsManager announcements={announcements} classes={classes} />;
}
