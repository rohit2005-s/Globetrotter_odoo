import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [trips, saved] = await Promise.all([
      prisma.trip.findMany({
        where: { userId: user.id },
        include: { stops: { include: { city: true } } },
      }),
      prisma.savedDestination.findMany({
        where: { userId: user.id },
        include: { city: true },
      }),
    ]);

    // Compute travel stats
    const totalTrips = trips.length;
    const countriesVisited = new Set<string>();
    let totalDaysPlanned = 0;
    let totalBudgetSum = 0;

    trips.forEach((t) => {
      totalBudgetSum += t.totalBudget || 0;
      t.stops.forEach((s) => {
        if (s.city?.country) countriesVisited.add(s.city.country);
      });
      const days = Math.ceil(Math.abs(new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24));
      totalDaysPlanned += Math.max(1, days);
    });

    return NextResponse.json({
      user,
      stats: {
        totalTrips,
        countriesCount: countriesVisited.size,
        totalDaysPlanned,
        totalBudgetSum,
        savedDestinationsCount: saved.length,
      },
      savedDestinations: saved.map((s) => s.city),
    });
  } catch (error: any) {
    console.error("Profile get error:", error);
    return NextResponse.json({ error: "Failed to get profile: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, avatar, homeCountry, currency, language } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(homeCountry && { homeCountry }),
        ...(currency && { currency }),
        ...(language && { language }),
      },
    });

    return NextResponse.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile: " + error.message }, { status: 500 });
  }
}
