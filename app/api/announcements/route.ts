import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(_request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(_request.url);
  const classId = searchParams.get("classId");

  const where: Record<string, unknown> = {};
  if (classId) where.classId = classId;

  const announcements = await prisma.announcement.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { title, content, type, classId } = await request.json();
    if (!title || !content || !type) {
      return NextResponse.json({ error: "Title, content, and type are required" }, { status: 400 });
    }
    if (!["exam", "homework", "update", "reminder"].includes(type)) {
      return NextResponse.json({ error: "Type must be exam, homework, update, or reminder" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: { title, content, type, teacherId: user!.id, classId: classId || null },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (e) {
    console.error("POST /api/announcements error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 });

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/announcements error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
