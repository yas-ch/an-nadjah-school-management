import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerGradesClient from "@/components/viewer/ViewerGradesClient";

export default async function StudentGrades() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const grades = await prisma.grade.findMany({
    where: { studentId: user.id },
    include: { class: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <ViewerGradesClient grades={grades} role="student" />;
}
