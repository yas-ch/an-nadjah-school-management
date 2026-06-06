import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (err) {
    // DYNAMIC_SERVER_USAGE is thrown by Next.js during build-time
    // static generation probe — not a real error
    if (
      err instanceof Error &&
      (err as any).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    console.error("[auth] getCurrentUser error:", err);
    return null;
  }
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }
  return { error: null, user };
}
