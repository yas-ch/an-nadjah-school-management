import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const ROLE_DASHBOARD: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

function getDashboardForRole(role: string | null): string | null {
  if (role && ROLE_DASHBOARD[role]) return ROLE_DASHBOARD[role];
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  if (pathname.startsWith("/api")) {
    if (pathname.startsWith("/api/auth/")) {
      return addSecurityHeaders(NextResponse.next());
    }
    if (!payload) {
      console.warn(`[middleware] API 401: ${pathname} (no valid token)`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return addSecurityHeaders(NextResponse.next());
  }

  const roleRoutes: Record<string, string> = {
    "/admin": "admin",
    "/teacher": "teacher",
    "/student": "student",
    "/parent": "parent",
  };

  for (const [prefix, role] of Object.entries(roleRoutes)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!payload) {
        console.warn(`[middleware] Redirect ${pathname} → /login (no token)`);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (payload.role !== role) {
        const ownDashboard = getDashboardForRole(payload.role);
        if (ownDashboard) {
          console.warn(
            `[middleware] Redirect ${pathname} → ${ownDashboard} (role ${payload.role} ≠ ${role})`
          );
          return NextResponse.redirect(new URL(ownDashboard, request.url));
        }
        console.warn(
          `[middleware] Redirect ${pathname} → /login (unknown role ${payload.role})`
        );
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return addSecurityHeaders(NextResponse.next());
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/teacher",
    "/teacher/:path*",
    "/student",
    "/student/:path*",
    "/parent",
    "/parent/:path*",
    "/api",
    "/api/:path*",
  ],
};
