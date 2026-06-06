import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  if (pathname.startsWith("/api")) {
    if (pathname.startsWith("/api/auth/")) return NextResponse.next();
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  const roleRoutes: Record<string, string> = {
    "/admin": "admin",
    "/teacher": "teacher",
    "/student": "student",
    "/parent": "parent",
  };

  for (const [prefix, role] of Object.entries(roleRoutes)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!payload || payload.role !== role) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/parent/:path*", "/api/:path*"],
};
