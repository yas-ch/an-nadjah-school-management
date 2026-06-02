import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerDashboardClient from "@/components/viewer/ViewerDashboardClient";

export default async function ParentDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true, name: true },
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

  const [grades, attendance, classes, recentResources, recentAnnouncements, recentNotes] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: { in: childIds } },
      include: {
        class: { select: { name: true } },
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendance.findMany({
      where: { studentId: { in: childIds } },
      include: {
        class: { select: { name: true, teacher: { select: { name: true } } } },
        student: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.class.findMany({
      where: { id: { in: classIds } },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.resource.findMany({
      where: classIds.length > 0 ? { classId: { in: classIds } } : { id: undefined },
      include: { teacher: { select: { name: true } }, class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.announcement.findMany({
      where: classIds.length > 0 ? { classId: { in: classIds } } : { id: undefined },
      include: { teacher: { select: { name: true } }, class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.sharedNote.findMany({
      where: {
        OR: [
          { studentId: { in: childIds } },
          ...(classIds.length > 0 ? [{ classId: { in: classIds } }] : []),
        ],
      },
      include: {
        teacher: { select: { name: true } },
        student: { select: { name: true } },
        class: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const avgScore = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : null;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : null;

  return (
    <ViewerDashboardClient
      user={{ id: user.id, name: user.name, email: user.email, role: "parent" }}
      grades={grades}
      attendance={attendance}
      avgScore={avgScore}
      attendanceRate={attendanceRate}
      presentCount={presentCount}
      totalAttendance={attendance.length}
      uniqueClasses={classes.length}
      recentResources={recentResources}
      recentAnnouncements={recentAnnouncements}
      recentNotes={recentNotes}
    />
  );
}
