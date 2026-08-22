import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: true,
        _count: {
          select: { stops: true, savedBy: true },
        },
      },
    });

    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({ city });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch city details: " + error.message }, { status: 500 });
  }
}
