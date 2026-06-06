import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/register"];
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  if (
    (pathname.startsWith("/admin") || pathname === "/admin") &&
    (!payload || payload.role !== "admin")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname.startsWith("/student") || pathname === "/student") &&
    (!payload || payload.role !== "student")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname.startsWith("/teacher") || pathname === "/teacher") &&
    (!payload || payload.role !== "teacher")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (pathname.startsWith("/parent") || pathname === "/parent") &&
    (!payload || payload.role !== "parent")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth/")) {
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
