import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const teacherId = searchParams.get("teacherId");

  const where: Record<string, unknown> = {};
  if (classId) where.classId = classId;
  if (teacherId) where.teacherId = teacherId;

  const resources = await prisma.resource.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { title, type, url, description, classId } = await request.json();
    if (!title || !type || !url) {
      return NextResponse.json({ error: "Title, type, and URL are required" }, { status: 400 });
    }
    if (!["pdf", "youtube", "link"].includes(type)) {
      return NextResponse.json({ error: "Type must be pdf, youtube, or link" }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: { title, type, url, description, teacherId: user!.id, classId: classId || null },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (e) {
    console.error("POST /api/resources error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/resources error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
