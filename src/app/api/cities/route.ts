import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const region = searchParams.get("region") || "ALL";
    const costIndex = searchParams.get("costIndex") || "ALL";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { country: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (region !== "ALL") {
      where.region = region;
    }

    if (costIndex !== "ALL") {
      where.costIndex = costIndex;
    }

    const cities = await prisma.city.findMany({
      where,
      take: limit,
      orderBy: [{ rating: "desc" }, { name: "asc" }],
      include: {
        activities: {
          take: 4,
        },
        _count: {
          select: { activities: true, stops: true, savedBy: true },
        },
        savedBy: user
          ? {
              where: { userId: user.id },
            }
          : false,
      },
    });

    const formattedCities = cities.map((city) => ({
      ...city,
      isSaved: user ? city.savedBy.length > 0 : false,
      activitiesCount: city._count.activities,
      visitedTripCount: city._count.stops,
    }));

    return NextResponse.json({ cities: formattedCities });
  } catch (error: any) {
    console.error("Cities fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cities: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, country, region, coverImage, description, costIndex, avgDailyCost, rating, popularSeason, currencyCode } = body;

    if (!name || !country || !region || !coverImage) {
      return NextResponse.json({ error: "Name, country, region, and coverImage are required" }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: {
        name,
        country,
        region,
        coverImage,
        description: description || `Discover the beauty and vibrant culture of ${name}.`,
        costIndex: costIndex || "MODERATE",
        avgDailyCost: avgDailyCost ? parseFloat(avgDailyCost) : 100,
        rating: rating ? parseFloat(rating) : 4.8,
        popularSeason: popularSeason || "All Year",
        currencyCode: currencyCode || "USD",
      },
    });

    return NextResponse.json({ city }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create city: " + error.message }, { status: 500 });
  }
}
