import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import AttendanceManager from "@/components/admin/AttendanceManager";

export default async function AdminAttendance() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [attendance, students, classes] = await Promise.all([
    prisma.attendance.findMany({
      orderBy: { date: "desc" },
      take: 100,
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <AttendanceManager initialData={attendance} students={students} classes={classes} />;
}
