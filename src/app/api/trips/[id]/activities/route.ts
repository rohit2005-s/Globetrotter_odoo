import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { stopId, activityId, customTitle, customCost, scheduledDate, timeSlot, customTime, notes } = body;

    if (!stopId || !scheduledDate) {
      return NextResponse.json({ error: "stopId and scheduledDate are required" }, { status: 400 });
    }

    // Get order index
    const lastActivity = await prisma.stopActivity.findFirst({
      where: { stopId },
      orderBy: { orderIndex: "desc" },
    });
    const orderIndex = lastActivity ? lastActivity.orderIndex + 1 : 0;

    let cost = customCost ? parseFloat(customCost) : 0;
    if (!customCost && activityId) {
      const act = await prisma.activity.findUnique({ where: { id: activityId } });
      if (act) cost = act.cost;
    }

    const stopActivity = await prisma.stopActivity.create({
      data: {
        stopId,
        activityId: activityId || null,
        customTitle: customTitle || null,
        customCost: cost,
        scheduledDate: new Date(scheduledDate),
        timeSlot: timeSlot || "MORNING",
        customTime: customTime || "09:00 AM",
        notes: notes || null,
        orderIndex,
      },
      include: {
        activity: true,
      },
    });

    return NextResponse.json({ stopActivity }, { status: 201 });
  } catch (error: any) {
    console.error("Add activity error:", error);
    return NextResponse.json({ error: "Failed to add activity: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { stopActivityId, customTitle, customCost, scheduledDate, timeSlot, customTime, notes, isCompleted, orderIndex } = body;

    if (!stopActivityId) {
      return NextResponse.json({ error: "stopActivityId is required" }, { status: 400 });
    }

    const updated = await prisma.stopActivity.update({
      where: { id: stopActivityId },
      data: {
        ...(customTitle !== undefined && { customTitle }),
        ...(customCost !== undefined && { customCost: parseFloat(customCost) }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(timeSlot && { timeSlot }),
        ...(customTime !== undefined && { customTime }),
        ...(notes !== undefined && { notes }),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
      include: {
        activity: true,
      },
    });

    return NextResponse.json({ stopActivity: updated });
  } catch (error: any) {
    console.error("Update activity error:", error);
    return NextResponse.json({ error: "Failed to update activity: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stopActivityId = searchParams.get("stopActivityId");

    if (!stopActivityId) {
      return NextResponse.json({ error: "stopActivityId is required" }, { status: 400 });
    }

    await prisma.stopActivity.delete({
      where: { id: stopActivityId },
    });

    return NextResponse.json({ success: true, message: "Activity removed from stop" });
  } catch (error: any) {
    console.error("Delete activity error:", error);
    return NextResponse.json({ error: "Failed to delete activity: " + error.message }, { status: 500 });
  }
}
