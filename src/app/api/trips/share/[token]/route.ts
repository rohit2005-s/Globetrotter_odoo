import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    const trip = await prisma.trip.findFirst({
      where: {
        OR: [{ shareToken: token }, { id: token }],
      },
      include: {
        user: {
          select: { name: true, avatar: true, bio: true, homeCountry: true },
        },
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: true,
            activities: {
              orderBy: { orderIndex: "asc" },
              include: { activity: true },
            },
          },
        },
        expenses: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error: any) {
    console.error("Public trip fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch shared trip: " + error.message }, { status: 500 });
  }
}
