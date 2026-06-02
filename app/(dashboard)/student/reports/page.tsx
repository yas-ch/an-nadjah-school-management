import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import ViewerReportsClient from "@/components/viewer/ViewerReportsClient";

export default async function StudentReports() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/");

  const grades = await prisma.grade.findMany({
    where: { studentId: user.id },
  });

  const avgScore = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : null;
  const passCount = grades.filter((g) => g.score >= 60).length;
  const passRate = grades.length > 0 ? ((passCount / grades.length) * 100).toFixed(0) : null;

  return <ViewerReportsClient avgScore={avgScore} passRate={passRate} gradesCount={grades.length} role="student" />;
}
