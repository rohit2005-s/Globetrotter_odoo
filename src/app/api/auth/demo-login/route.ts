import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json().catch(() => ({ role: "USER" }));

    const targetEmail = role === "ADMIN" ? "admin@globetrotter.com" : "demo@globetrotter.com";

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      // Fallback first user
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: "No demo user found" }, { status: 404 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        currency: user.currency,
        language: user.language,
      },
      token,
    });

    response.cookies.set({
      name: "gt_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Demo login failed: " + error.message }, { status: 500 });
  }
}
