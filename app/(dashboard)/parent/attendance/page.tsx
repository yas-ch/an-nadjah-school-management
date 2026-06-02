import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerAttendanceClient from "@/components/viewer/ViewerAttendanceClient";

export default async function ParentAttendance() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") redirect("/");

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true, name: true },
  });
  const childIds = children.map((c) => c.id);

  const attendance = await prisma.attendance.findMany({
    where: { studentId: { in: childIds } },
    include: {
      class: { select: { name: true, teacher: { select: { name: true } } } },
      student: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return <ViewerAttendanceClient attendance={attendance} role="parent" />;
}
