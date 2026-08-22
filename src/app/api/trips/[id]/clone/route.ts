import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const original = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            activities: true,
          },
        },
        expenses: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Clone trip for current user
    const clonedTrip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: `Copy of ${original.title}`,
        description: original.description,
        coverImage: original.coverImage,
        startDate: original.startDate,
        endDate: original.endDate,
        totalBudget: original.totalBudget,
        currency: original.currency,
        status: "UPCOMING",
        isPublic: false,
      },
    });

    // Clone stops and activities
    for (const stop of original.stops) {
      const clonedStop = await prisma.stop.create({
        data: {
          tripId: clonedTrip.id,
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          accommodationName: stop.accommodationName,
          accommodationCost: stop.accommodationCost,
          notes: stop.notes,
        },
      });

      for (const act of stop.activities) {
        await prisma.stopActivity.create({
          data: {
            stopId: clonedStop.id,
            activityId: act.activityId,
            customTitle: act.customTitle,
            customCost: act.customCost,
            scheduledDate: act.scheduledDate,
            timeSlot: act.timeSlot,
            customTime: act.customTime,
            notes: act.notes,
            orderIndex: act.orderIndex,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      clonedTripId: clonedTrip.id,
      message: "Trip cloned to your account successfully!",
    });
  } catch (error: any) {
    console.error("Clone trip error:", error);
    return NextResponse.json({ error: "Failed to clone trip: " + error.message }, { status: 500 });
  }
}
