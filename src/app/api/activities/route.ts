import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const cityId = searchParams.get("cityId") || "";
    const maxCost = searchParams.get("maxCost");
    const limit = parseInt(searchParams.get("limit") || "60");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (category !== "ALL") {
      where.category = category;
    }

    if (cityId) {
      where.cityId = cityId;
    }

    if (maxCost) {
      where.cost = { lte: parseFloat(maxCost) };
    }

    const activities = await prisma.activity.findMany({
      where,
      take: limit,
      orderBy: [{ rating: "desc" }, { isPopular: "desc" }],
      include: {
        city: true,
      },
    });

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error("Activities fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch activities: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { cityId, title, description, category, image, cost, durationHours, rating, location } = body;

    if (!cityId || !title || !image) {
      return NextResponse.json({ error: "City ID, title, and image are required" }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        cityId,
        title,
        description: description || "Explore exciting attractions and local experiences.",
        category: category || "SIGHTSEEING",
        image,
        cost: cost ? parseFloat(cost) : 25,
        durationHours: durationHours ? parseFloat(durationHours) : 2,
        rating: rating ? parseFloat(rating) : 4.8,
        location: location || null,
        isPopular: true,
      },
      include: { city: true },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create activity: " + error.message }, { status: 500 });
  }
}
