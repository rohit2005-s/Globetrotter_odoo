import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: tripId } = params;
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: "desc" },
      include: { stop: { include: { city: true } } },
    });

    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch expenses: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = params;
    const body = await req.json();
    const { title, category, amount, date, stopId, notes } = body;

    if (!title || amount === undefined) {
      return NextResponse.json({ error: "Title and amount are required" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        tripId,
        stopId: stopId || null,
        title,
        category: category || "MISC",
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error("Add expense error:", error);
    return NextResponse.json({ error: "Failed to add expense: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const expenseId = searchParams.get("expenseId");

    if (!expenseId) {
      return NextResponse.json({ error: "expenseId is required" }, { status: 400 });
    }

    await prisma.expense.delete({ where: { id: expenseId } });

    return NextResponse.json({ success: true, message: "Expense removed" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete expense: " + error.message }, { status: 500 });
  }
}
