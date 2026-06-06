import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";
import { signToken } from "@/lib/auth";

function validateEnv() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    console.error("[auth] Missing environment variables:", missing.join(", "));
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

export async function POST(request: Request) {
  try {
    validateEnv();

    let email: string, password: string;
    try {
      const body = await request.json();
      email = body.email?.trim().toLowerCase();
      password = body.password;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let valid: boolean;
    try {
      valid = await verifyPassword(password, user.password);
    } catch (err) {
      console.error("[auth] bcrypt verify failed:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let token: string;
    try {
      token = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      console.error("[auth] JWT signing failed:", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    console.log(`[auth] Login successful: ${email} (${user.role})`);
    return response;
  } catch (err) {
    console.error("[auth] Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
