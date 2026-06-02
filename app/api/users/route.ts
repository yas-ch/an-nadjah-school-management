import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { error, user } = await requireAuth(["admin"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      studentProfile: true,
      teacherProfile: true,
      _count: { select: { grades: true, attendance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { email, password, name, role, ...profileData } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const bcrypt = await import("@/lib/passwords");
    const hashed = await bcrypt.hashPassword(password);

    const created = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role,
        ...(role === "student"
          ? {
              studentProfile: {
                create: {
                  grade: profileData.grade || "",
                  guardian: profileData.guardian || "",
                  phone: profileData.phone || "",
                  address: profileData.address || "",
                },
              },
            }
          : {}),
        ...(role === "teacher"
          ? {
              teacherProfile: {
                create: {
                  teacherId: profileData.teacherId || `TCH-${Date.now()}`,
                  department: profileData.department || "",
                  phone: profileData.phone || "",
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentProfile: true,
        teacherProfile: true,
      },
    });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/users error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAuth(["admin"]);
  if (error) return error;

  try {
    const { id, name, email, role, ...profileData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, teacherProfile: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (existing.role === "student" && profileData.grade !== undefined) {
      await prisma.studentProfile.upsert({
        where: { userId: id },
        update: {
          grade: profileData.grade,
          guardian: profileData.guardian ?? existing.studentProfile?.guardian,
          phone: profileData.phone ?? existing.studentProfile?.phone,
          address: profileData.address ?? existing.studentProfile?.address,
        },
        create: {
          userId: id,
          grade: profileData.grade || "",
          guardian: profileData.guardian || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        },
      });
    }

    if (existing.role === "teacher" && profileData.department !== undefined) {
      await prisma.teacherProfile.upsert({
        where: { userId: id },
        update: {
          department: profileData.department,
          phone: profileData.phone ?? existing.teacherProfile?.phone,
          teacherId: profileData.teacherId ?? existing.teacherProfile?.teacherId,
        },
        create: {
          userId: id,
          teacherId: profileData.teacherId || `TCH-${Date.now()}`,
          department: profileData.department || "",
          phone: profileData.phone || "",
        },
      });
    }

    const final = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, teacherProfile: true },
    });

    return NextResponse.json({ user: final });
  } catch (e) {
    console.error("PUT /api/users error:", e);
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

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/users error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
