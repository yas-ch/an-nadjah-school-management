import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSettings from "@/components/admin/AdminSettings";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const stats = {
    totalStudents: await prisma.user.count({ where: { role: "student" } }),
    totalTeachers: await prisma.user.count({ where: { role: "teacher" } }),
    totalClasses: await prisma.class.count(),
    totalSubjects: await prisma.subject.count(),
    totalGrades: await prisma.grade.count(),
    totalAttendance: await prisma.attendance.count(),
  };

  return <AdminSettings user={{ name: user.name, email: user.email }} stats={stats} />;
}
