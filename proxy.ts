import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "OWNER" && payload.role !== "ADMIN")
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page must remain publicly accessible.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("nomads_session")?.value;

  // No session → send user to login.
  if (!token) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  // Invalid/expired session → send user to login.
  const session = await verifySession(token);

  if (!session) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.delete("nomads_session");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};