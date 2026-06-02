import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerDashboardClient from "@/components/viewer/ViewerDashboardClient";

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const enrolledClasses = await prisma.class.findMany({
    where: {
      OR: [
        { grades: { some: { studentId: user.id } } },
        { attendance: { some: { studentId: user.id } } },
      ],
    },
    select: { id: true, name: true, teacher: { select: { name: true } } },
  });
  const classIds = enrolledClasses.map((c) => c.id);

  const [grades, attendance, profile, recentResources, recentAnnouncements, recentNotes] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendance.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, teacher: { select: { name: true } } } } },
      orderBy: { date: "desc" },
    }),
    prisma.studentProfile.findUnique({ where: { userId: user.id } }),
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
          { studentId: user.id },
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
  const uniqueClasses = enrolledClasses.length;

  return (
    <ViewerDashboardClient
      user={{ id: user.id, name: user.name, email: user.email, role: "student" }}
      grades={grades}
      attendance={attendance}
      avgScore={avgScore}
      attendanceRate={attendanceRate}
      presentCount={presentCount}
      totalAttendance={attendance.length}
      uniqueClasses={uniqueClasses}
      profile={profile ? { grade: profile.grade, guardian: profile.guardian, phone: profile.phone, address: profile.address } : null}
      recentResources={recentResources}
      recentAnnouncements={recentAnnouncements}
      recentNotes={recentNotes}
    />
  );
}
