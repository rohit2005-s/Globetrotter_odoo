import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const where: any = {
      userId: user.id,
    };

    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        {
          stops: {
            some: {
              city: {
                name: { contains: search },
              },
            },
          },
        },
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: true,
            activities: {
              include: {
                activity: true,
              },
            },
          },
        },
        expenses: true,
        _count: {
          select: {
            stops: true,
            likes: true,
          },
        },
      },
    });

    // Calculate aggregated summary for each trip
    const tripsWithSummary = trips.map((trip) => {
      let totalActivities = 0;
      let calculatedActivitiesCost = 0;
      let calculatedAccommodationCost = 0;

      trip.stops.forEach((stop) => {
        calculatedAccommodationCost += stop.accommodationCost || 0;
        totalActivities += stop.activities.length;
        stop.activities.forEach((act) => {
          calculatedActivitiesCost += act.customCost || act.activity?.cost || 0;
        });
      });

      const loggedExpensesCost = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalEstimatedCost = Math.max(loggedExpensesCost, calculatedAccommodationCost + calculatedActivitiesCost);

      return {
        ...trip,
        destinationCount: trip.stops.length,
        activityCount: totalActivities,
        totalEstimatedCost,
        budgetUsedPercent: Math.round((totalEstimatedCost / (trip.totalBudget || 1)) * 100),
        destinationsList: trip.stops.map((s) => s.city.name).join(", "),
      };
    });

    return NextResponse.json({ trips: tripsWithSummary });
  } catch (error: any) {
    console.error("Fetch trips error:", error);
    return NextResponse.json({ error: "Failed to fetch trips: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      coverImage,
      startDate,
      endDate,
      totalBudget,
      currency,
      isPublic,
      cityIds,
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: "Title, start date, and end date are required" }, { status: 400 });
    }

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title,
        description: description || "",
        coverImage:
          coverImage ||
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudget: totalBudget ? parseFloat(totalBudget) : 1500,
        currency: currency || user.currency || "USD",
        isPublic: isPublic ?? false,
        status: "UPCOMING",
      },
    });

    // If initial cities provided, automatically create stops
    if (cityIds && Array.isArray(cityIds) && cityIds.length > 0) {
      const tripStart = new Date(startDate).getTime();
      const tripEnd = new Date(endDate).getTime();
      const totalDays = Math.max(1, Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)));
      const daysPerStop = Math.max(1, Math.floor(totalDays / cityIds.length));

      for (let i = 0; i < cityIds.length; i++) {
        const stopArrival = new Date(tripStart + i * daysPerStop * 24 * 60 * 60 * 1000);
        const stopDeparture =
          i === cityIds.length - 1
            ? new Date(tripEnd)
            : new Date(tripStart + (i + 1) * daysPerStop * 24 * 60 * 60 * 1000);

        const city = await prisma.city.findUnique({
          where: { id: cityIds[i] },
          include: { activities: true },
        });

        const stop = await prisma.stop.create({
          data: {
            tripId: trip.id,
            cityId: cityIds[i],
            orderIndex: i,
            arrivalDate: stopArrival,
            departureDate: stopDeparture,
            accommodationName: city ? `${city.name} Central Hotel` : "Local Hotel",
            accommodationCost: (city?.avgDailyCost ? city.avgDailyCost * 0.6 : 80) * daysPerStop,
          },
        });

        // Add 1-2 top popular activities if available
        if (city && city.activities && city.activities.length > 0) {
          await prisma.stopActivity.create({
            data: {
              stopId: stop.id,
              activityId: city.activities[0].id,
              customCost: city.activities[0].cost,
              scheduledDate: stopArrival,
              timeSlot: "MORNING",
              customTime: "10:00 AM",
              orderIndex: 0,
            },
          });
        }
      }
    }

    const createdTrip = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: { activity: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ trip: createdTrip }, { status: 201 });
  } catch (error: any) {
    console.error("Create trip error:", error);
    return NextResponse.json({ error: "Failed to create trip: " + error.message }, { status: 500 });
  }
}
