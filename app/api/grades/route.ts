import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

function letterGrade(score: number): string {
  if (score >= 18) return "A+";
  if (score >= 16) return "A";
  if (score >= 14) return "B";
  if (score >= 12) return "C";
  if (score >= 10) return "D";
  return "F";
}

function performanceLabel(score: number): string {
  if (score >= 16) return "Excellent";
  if (score >= 14) return "Very Good";
  if (score >= 12) return "Good";
  if (score >= 10) return "Average";
  return "Needs Improvement";
}

export async function GET(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (user!.role === "student") {
    where.studentId = user!.id;
  }
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (search && user!.role !== "student") {
    where.student = {
      name: { contains: search, mode: "insensitive" },
    };
  }

  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ grades });
}

export async function POST(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { studentId, classId, subject, score } = await request.json();

    if (!studentId || !classId || !subject || score === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const grade = letterGrade(score);

    const created = await prisma.grade.create({
      data: { studentId, classId, subject, score, grade },
    });

    return NextResponse.json({ grade: created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/grades error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id, score, subject, studentId, classId } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (score !== undefined) {
      data.score = score;
      data.grade = letterGrade(score);
    }
    if (subject !== undefined) data.subject = subject;
    if (studentId !== undefined) data.studentId = studentId;
    if (classId !== undefined) data.classId = classId;

    const updated = await prisma.grade.update({
      where: { id },
      data,
    });

    return NextResponse.json({ grade: updated });
  } catch (e) {
    console.error("PUT /api/grades error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    await prisma.grade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/grades error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
