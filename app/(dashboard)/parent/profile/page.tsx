import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerProfileClient from "@/components/viewer/ViewerProfileClient";

export default async function ParentProfile() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true },
  });
  const childIds = children.map((c) => c.id);

  const [grades, attendance] = await Promise.all([
    prisma.grade.findMany({ where: { studentId: { in: childIds } } }),
    prisma.attendance.findMany({ where: { studentId: { in: childIds } } }),
  ]);

  const avgScore = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : null;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : null;

  return (
    <ViewerProfileClient
      user={{ id: user.id, name: user.name, email: user.email, role: "parent" }}
      gradesCount={grades.length}
      attendanceRate={attendanceRate}
      avgScore={avgScore}
    />
  );
}
