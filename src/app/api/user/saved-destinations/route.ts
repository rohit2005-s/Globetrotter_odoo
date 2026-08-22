import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedDestination.findMany({
      where: { userId: user.id },
      include: {
        city: {
          include: { activities: true },
        },
      },
    });

    return NextResponse.json({ saved: saved.map((s) => s.city) });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch saved destinations: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cityId } = await req.json();
    if (!cityId) {
      return NextResponse.json({ error: "cityId is required" }, { status: 400 });
    }

    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: {
          userId: user.id,
          cityId,
        },
      },
    });

    if (existing) {
      await prisma.savedDestination.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: "Removed from wishlist" });
    } else {
      await prisma.savedDestination.create({
        data: {
          userId: user.id,
          cityId,
        },
      });
      return NextResponse.json({ saved: true, message: "Saved to wishlist" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to toggle saved destination: " + error.message }, { status: 500 });
  }
}
