import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(_request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(_request.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");
  const subject = searchParams.get("subject");

  const where: Record<string, unknown> = {};
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (subject) where.subject = subject;

  const notes = await prisma.sharedNote.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { content, type, subject, academicNote, behaviorNote, recommendation, status, studentId, classId } = await request.json();
    if (!content || !type) {
      return NextResponse.json({ error: "Content and type are required" }, { status: 400 });
    }
    if (!["class", "student", "behavior"].includes(type)) {
      return NextResponse.json({ error: "Type must be class, student, or behavior" }, { status: 400 });
    }

    const note = await prisma.sharedNote.create({
      data: {
        content,
        type,
        subject: subject || null,
        academicNote: academicNote || null,
        behaviorNote: behaviorNote || null,
        recommendation: recommendation || null,
        status: status || "active",
        teacherId: user!.id,
        studentId: type !== "class" && studentId ? studentId : null,
        classId: classId || null,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    console.error("POST /api/shared-notes error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id, content, type, subject, academicNote, behaviorNote, recommendation, status, studentId, classId } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await prisma.sharedNote.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (content !== undefined) data.content = content;
    if (type !== undefined) data.type = type;
    if (subject !== undefined) data.subject = subject;
    if (academicNote !== undefined) data.academicNote = academicNote;
    if (behaviorNote !== undefined) data.behaviorNote = behaviorNote;
    if (recommendation !== undefined) data.recommendation = recommendation;
    if (status !== undefined) data.status = status;
    if (studentId !== undefined) data.studentId = studentId;
    if (classId !== undefined) data.classId = classId;

    const note = await prisma.sharedNote.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ note });
  } catch (e) {
    console.error("PUT /api/shared-notes error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await prisma.sharedNote.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    await prisma.sharedNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/shared-notes error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
