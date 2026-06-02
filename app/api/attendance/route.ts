import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (user!.role === "student") {
    where.studentId = user!.id;
  }
  if (classId) where.classId = classId;
  if (studentId) where.studentId = studentId;
  if (date) {
    const d = new Date(date);
    where.date = {
      gte: new Date(d.setHours(0, 0, 0, 0)),
      lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }
  if (status) where.status = status;

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, teacher: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json({ attendance });
}

export async function POST(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { studentId, classId, date, time, subject, status: attStatus, justified, notes } = await request.json();

    if (!studentId || !classId || !date || !attStatus) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["present", "absent", "late"].includes(attStatus)) {
      return NextResponse.json(
        { error: "Status must be present, absent, or late" },
        { status: 400 }
      );
    }

    const created = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        date: new Date(date),
        time: time || null,
        subject: subject || null,
        status: attStatus,
        justified: justified === true,
        notes: notes || null,
      },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, teacher: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ attendance: created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/attendance error:", e);
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
    const { id, status: attStatus, date, time, subject, justified, notes, studentId, classId } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (attStatus && !["present", "absent", "late"].includes(attStatus)) {
      return NextResponse.json(
        { error: "Status must be present, absent, or late" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (attStatus !== undefined) data.status = attStatus;
    if (date !== undefined) data.date = new Date(date);
    if (time !== undefined) data.time = time;
    if (subject !== undefined) data.subject = subject;
    if (justified !== undefined) data.justified = justified;
    if (notes !== undefined) data.notes = notes;
    if (studentId !== undefined) data.studentId = studentId;
    if (classId !== undefined) data.classId = classId;

    const updated = await prisma.attendance.update({
      where: { id },
      data,
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, teacher: { select: { name: true } } } },
      },
    });

    return NextResponse.json({ attendance: updated });
  } catch (e) {
    console.error("PUT /api/attendance error:", e);
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

    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/attendance error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}