import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/passwords";
import { signToken } from "@/lib/auth";

function isHTTPS(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === "https:") return true;
  if (request.headers.get("x-forwarded-proto") === "https") return true;
  return false;
}

export async function POST(request: Request) {
  try {
    let email: string, password: string, name: string, role: string;
    try {
      const body = await request.json();
      email = body.email?.trim().toLowerCase();
      password = body.password;
      name = body.name?.trim();
      role = body.role;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["admin", "student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, student, or teacher" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isHTTPS(request),
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    console.log(`[auth] Register OK: ${email} (${user.role}) secure=${isHTTPS(request)}`);
    return response;
  } catch (err) {
    console.error("[auth] Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
