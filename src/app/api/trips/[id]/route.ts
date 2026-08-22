import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    const { id } = params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: {
              include: {
                activities: true,
              },
            },
            activities: {
              orderBy: { orderIndex: "asc" },
              include: {
                activity: true,
              },
            },
          },
        },
        expenses: {
          orderBy: { date: "desc" },
        },
        likes: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check permission (owner or public)
    if (!trip.isPublic && (!user || user.id !== trip.userId)) {
      return NextResponse.json({ error: "Unauthorized access to private trip" }, { status: 403 });
    }

    const isOwner = user?.id === trip.userId;
    const isLiked = user ? trip.likes.some((l) => l.userId === user.id) : false;

    return NextResponse.json({
      trip: {
        ...trip,
        isOwner,
        isLiked,
        likesCount: trip.likes.length,
      },
    });
  } catch (error: any) {
    console.error("Get trip details error:", error);
    return NextResponse.json({ error: "Failed to fetch trip details: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, coverImage, startDate, endDate, totalBudget, currency, status, isPublic } = body;

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(coverImage && { coverImage }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(totalBudget !== undefined && { totalBudget: parseFloat(totalBudget) }),
        ...(currency && { currency }),
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        stops: {
          include: { city: true },
        },
      },
    });

    return NextResponse.json({ trip: updated });
  } catch (error: any) {
    console.error("Update trip error:", error);
    return NextResponse.json({ error: "Failed to update trip: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.trip.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Trip deleted successfully" });
  } catch (error: any) {
    console.error("Delete trip error:", error);
    return NextResponse.json({ error: "Failed to delete trip: " + error.message }, { status: 500 });
  }
}
