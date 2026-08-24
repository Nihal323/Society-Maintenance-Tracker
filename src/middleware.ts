import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-society-tracker-change-in-production-32-chars-min"
);

const TOKEN_NAME = "society_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isResidentRoute = pathname.startsWith("/resident");
  const isAdminRoute = pathname.startsWith("/admin");

  // If user is already logged in and visits login/register, redirect to dashboard
  if (isAuthPage && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/resident/dashboard", req.url));
  }

  // If user is not logged in and tries to access protected pages
  if ((isResidentRoute || isAdminRoute) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role enforcement: Resident cannot access admin routes
  if (isAdminRoute && session && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/resident/dashboard?error=unauthorized_admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/resident/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
