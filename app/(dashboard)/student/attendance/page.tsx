import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerAttendanceClient from "@/components/viewer/ViewerAttendanceClient";

export default async function StudentAttendance() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const attendance = await prisma.attendance.findMany({
    where: { studentId: user.id },
    include: { class: { select: { name: true, teacher: { select: { name: true } } } } },
    orderBy: { date: "desc" },
  });

  return <ViewerAttendanceClient attendance={attendance} role="student" />;
}
