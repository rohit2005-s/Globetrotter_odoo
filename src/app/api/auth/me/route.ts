import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const [tripCount, savedCount] = await Promise.all([
      prisma.trip.count({ where: { userId: user.id } }),
      prisma.savedDestination.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        homeCountry: user.homeCountry,
        currency: user.currency,
        language: user.language,
        role: user.role,
        tripCount,
        savedCount,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 });
  }
}
