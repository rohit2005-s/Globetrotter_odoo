import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "globetrotter_super_secret_jwt_key_2026_hackathon";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(request?: NextRequest) {
  let token: string | undefined;

  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get("gt_token")?.value;
    } catch (e) {
      // cookies() might fail in some contexts
    }
  }

  if (!token) {
    // Return default demo user if not logged in to make demoing effortless
    const demo = await prisma.user.findUnique({
      where: { email: "demo@globetrotter.com" },
    });
    return demo;
  }

  const payload = verifyToken(token);
  if (!payload) {
    const demo = await prisma.user.findUnique({
      where: { email: "demo@globetrotter.com" },
    });
    return demo;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}
