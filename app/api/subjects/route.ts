import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  const subjects = await prisma.subject.findMany({
    include: { teacher: { select: { id: true, name: true, email: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { name, code, teacherId } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const subject = await prisma.subject.create({
      data: { name, code: code || null, teacherId: teacherId || null },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002")
      return NextResponse.json({ error: "Subject name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { id, name, code, teacherId } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const subject = await prisma.subject.update({
      where: { id },
      data: { ...(name ? { name } : {}), code, teacherId: teacherId || null },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ subject });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
