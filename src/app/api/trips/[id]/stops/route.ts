import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = params;
    const body = await req.json();
    const { cityId, arrivalDate, departureDate, accommodationName, accommodationCost, notes } = body;

    if (!cityId || !arrivalDate || !departureDate) {
      return NextResponse.json({ error: "City, arrival date, and departure date are required" }, { status: 400 });
    }

    // Get current highest orderIndex
    const lastStop = await prisma.stop.findFirst({
      where: { tripId },
      orderBy: { orderIndex: "desc" },
    });

    const nextOrder = lastStop ? lastStop.orderIndex + 1 : 0;

    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityId,
        orderIndex: nextOrder,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        accommodationName: accommodationName || null,
        accommodationCost: accommodationCost ? parseFloat(accommodationCost) : 0,
        notes: notes || null,
      },
      include: {
        city: {
          include: { activities: true },
        },
        activities: {
          include: { activity: true },
        },
      },
    });

    return NextResponse.json({ stop }, { status: 201 });
  } catch (error: any) {
    console.error("Add stop error:", error);
    return NextResponse.json({ error: "Failed to add stop: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { stopId, orderIndex, arrivalDate, departureDate, accommodationName, accommodationCost, notes, orderedStopIds } = body;

    // Handle reordering array of stops
    if (orderedStopIds && Array.isArray(orderedStopIds)) {
      for (let i = 0; i < orderedStopIds.length; i++) {
        await prisma.stop.update({
          where: { id: orderedStopIds[i] },
          data: { orderIndex: i },
        });
      }
      return NextResponse.json({ success: true, message: "Stops reordered successfully" });
    }

    if (!stopId) {
      return NextResponse.json({ error: "stopId is required" }, { status: 400 });
    }

    const updated = await prisma.stop.update({
      where: { id: stopId },
      data: {
        ...(orderIndex !== undefined && { orderIndex }),
        ...(arrivalDate && { arrivalDate: new Date(arrivalDate) }),
        ...(departureDate && { departureDate: new Date(departureDate) }),
        ...(accommodationName !== undefined && { accommodationName }),
        ...(accommodationCost !== undefined && { accommodationCost: parseFloat(accommodationCost) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        city: true,
        activities: {
          include: { activity: true },
        },
      },
    });

    return NextResponse.json({ stop: updated });
  } catch (error: any) {
    console.error("Update stop error:", error);
    return NextResponse.json({ error: "Failed to update stop: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stopId = searchParams.get("stopId");

    if (!stopId) {
      return NextResponse.json({ error: "stopId query param is required" }, { status: 400 });
    }

    await prisma.stop.delete({
      where: { id: stopId },
    });

    return NextResponse.json({ success: true, message: "Stop deleted successfully" });
  } catch (error: any) {
    console.error("Delete stop error:", error);
    return NextResponse.json({ error: "Failed to delete stop: " + error.message }, { status: 500 });
  }
}
