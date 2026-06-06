import { NextResponse } from "next/server";

function isHTTPS(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === "https:") return true;
  if (request.headers.get("x-forwarded-proto") === "https") return true;
  return false;
}

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: isHTTPS(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  console.log("[auth] Logout OK — token cookie cleared");
  return response;
}
