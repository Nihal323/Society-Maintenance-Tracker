import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UserRole, UserSession } from "@/types";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-society-tracker-change-in-production-32-chars-min"
);

const TOKEN_NAME = "society_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (err) {
    return null;
  }
}

export async function setSessionCookie(session: UserSession): Promise<string> {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const decoded = await verifySessionToken(token);
    if (!decoded) return null;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, unitNumber: true, phone: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      unitNumber: user.unitNumber,
      phone: user.phone,
    };
  } catch (error) {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  try {
    const token = req.cookies.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest, allowedRoles?: UserRole[]): Promise<{ session: UserSession } | { errorResponse: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden. You do not have permission to access this resource." },
        { status: 403 }
      ),
    };
  }

  return { session };
}
