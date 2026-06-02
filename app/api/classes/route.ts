import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const nameFilter = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  let classes;
  if (user!.role === "admin") {
    classes = await prisma.class.findMany({
      where: nameFilter,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { grades: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else if (user!.role === "teacher") {
    classes = await prisma.class.findMany({
      where: { teacherId: user!.id, ...nameFilter },
      include: {
        _count: { select: { grades: true } },
      },
    });
  } else {
    classes = await prisma.class.findMany({
      where: {
        ...nameFilter,
        grades: { some: { studentId: user!.id } },
      },
    });
  }

  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const { error } = await requireAuth(["admin", "teacher"]);
  if (error) return error;

  try {
    const { name, section, teacherId } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const cls = await prisma.class.create({
      data: {
        name,
        section: section || "",
        teacherId: teacherId || "",
      },
    });

    return NextResponse.json({ class: cls }, { status: 201 });
  } catch (e) {
    console.error("POST /api/classes error:", e);
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
    const { id, name, section, teacherId } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(section !== undefined ? { section } : {}),
        ...(teacherId !== undefined ? { teacherId } : {}),
      },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { grades: true } },
      },
    });

    return NextResponse.json({ class: updated });
  } catch (e) {
    console.error("PUT /api/classes error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/classes error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
