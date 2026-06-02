import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerProfileClient from "@/components/viewer/ViewerProfileClient";

export default async function StudentProfile() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const [grades, attendance, profile] = await Promise.all([
    prisma.grade.findMany({ where: { studentId: user.id } }),
    prisma.attendance.findMany({ where: { studentId: user.id } }),
    prisma.studentProfile.findUnique({ where: { userId: user.id } }),
  ]);

  const avgScore = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : null;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : null;

  return (
    <ViewerProfileClient
      user={{ id: user.id, name: user.name, email: user.email, role: "student" }}
      profile={profile ? { grade: profile.grade, guardian: profile.guardian, phone: profile.phone, address: profile.address, enrolledAt: profile.enrolledAt } : null}
      gradesCount={grades.length}
      attendanceRate={attendanceRate}
      avgScore={avgScore}
    />
  );
}
