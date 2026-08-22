import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDurationDays } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: tripId } = params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: { activity: true },
            },
          },
        },
        expenses: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const durationDays = calculateDurationDays(trip.startDate, trip.endDate);

    // Initial breakdown categories
    const categories: Record<string, number> = {
      TRANSPORT: 0,
      ACCOMMODATION: 0,
      ACTIVITIES: 0,
      FOOD: 0,
      MISC: 0,
    };

    // 1. Calculate from stops accommodation
    trip.stops.forEach((stop) => {
      categories.ACCOMMODATION += stop.accommodationCost || 0;
    });

    // 2. Calculate from scheduled activities
    trip.stops.forEach((stop) => {
      stop.activities.forEach((act) => {
        const cost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
        categories.ACTIVITIES += cost;
      });
    });

    // 3. Incorporate explicit expenses
    trip.expenses.forEach((exp) => {
      const cat = exp.category.toUpperCase();
      if (categories[cat] !== undefined) {
        categories[cat] += exp.amount;
      } else {
        categories.MISC += exp.amount;
      }
    });

    const totalEstimated = Object.values(categories).reduce((a, b) => a + b, 0);
    const totalBudget = trip.totalBudget || 1500;
    const remainingBudget = totalBudget - totalEstimated;
    const avgDailyCost = Math.round(totalEstimated / durationDays);
    const isOverbudget = totalEstimated > totalBudget;
    const budgetUsedPercent = Math.min(200, Math.round((totalEstimated / totalBudget) * 100));

    // Daily breakdown for Bar charts
    const dailyBreakdownMap: Record<string, { date: string; displayDate: string; total: number; activities: number; stay: number; other: number }> = {};

    const startMs = new Date(trip.startDate).getTime();
    for (let i = 0; i < durationDays; i++) {
      const dayDate = new Date(startMs + i * 24 * 60 * 60 * 1000);
      const dateKey = dayDate.toISOString().split("T")[0];
      const displayDate = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyBreakdownMap[dateKey] = {
        date: dateKey,
        displayDate: `Day ${i + 1} (${displayDate})`,
        total: 0,
        activities: 0,
        stay: 0,
        other: 0,
      };
    }

    // Distribute accommodation across stop days
    trip.stops.forEach((stop) => {
      const stopDays = calculateDurationDays(stop.arrivalDate, stop.departureDate);
      const dailyStay = stop.accommodationCost / Math.max(1, stopDays);
      const stopStartMs = new Date(stop.arrivalDate).getTime();
      for (let d = 0; d < stopDays; d++) {
        const curDate = new Date(stopStartMs + d * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        if (dailyBreakdownMap[curDate]) {
          dailyBreakdownMap[curDate].stay += Math.round(dailyStay);
          dailyBreakdownMap[curDate].total += Math.round(dailyStay);
        }
      }

      // Add scheduled activities to respective dates
      stop.activities.forEach((act) => {
        const actDate = new Date(act.scheduledDate).toISOString().split("T")[0];
        const cost = act.customCost !== null ? act.customCost : act.activity?.cost || 0;
        if (dailyBreakdownMap[actDate]) {
          dailyBreakdownMap[actDate].activities += cost;
          dailyBreakdownMap[actDate].total += cost;
        }
      });
    });

    // Add logged expenses to daily breakdown
    trip.expenses.forEach((exp) => {
      const expDate = new Date(exp.date).toISOString().split("T")[0];
      if (dailyBreakdownMap[expDate]) {
        dailyBreakdownMap[expDate].other += exp.amount;
        dailyBreakdownMap[expDate].total += exp.amount;
      }
    });

    const dailyBreakdown = Object.values(dailyBreakdownMap);

    // Generate alerts
    const alerts: { type: "danger" | "warning" | "info" | "success"; message: string }[] = [];
    if (isOverbudget) {
      alerts.push({
        type: "danger",
        message: `Trip is currently exceeding target budget by ${formatCurrencySimple(totalEstimated - totalBudget, trip.currency)} (${budgetUsedPercent}%)!`,
      });
    } else if (budgetUsedPercent >= 85) {
      alerts.push({
        type: "warning",
        message: `You have utilized ${budgetUsedPercent}% of your planned budget. Only ${formatCurrencySimple(remainingBudget, trip.currency)} remaining.`,
      });
    } else {
      alerts.push({
        type: "success",
        message: `Great planning! You are well within budget with ${formatCurrencySimple(remainingBudget, trip.currency)} remaining buffer.`,
      });
    }

    if (categories.ACCOMMODATION > totalBudget * 0.5) {
      alerts.push({
        type: "info",
        message: "Accommodation represents over 50% of your total estimated expenditure.",
      });
    }

    // Pie chart formatted data
    const pieData = [
      { name: "Accommodation", value: categories.ACCOMMODATION, color: "#38bdf8" },
      { name: "Transport", value: categories.TRANSPORT, color: "#818cf8" },
      { name: "Activities", value: categories.ACTIVITIES, color: "#34d399" },
      { name: "Food & Dining", value: categories.FOOD, color: "#fbbf24" },
      { name: "Miscellaneous", value: categories.MISC, color: "#a78bfa" },
    ].filter((item) => item.value > 0);

    return NextResponse.json({
      summary: {
        totalBudget,
        totalEstimated,
        remainingBudget,
        currency: trip.currency,
        durationDays,
        avgDailyCost,
        budgetUsedPercent,
        isOverbudget,
        categories,
        pieData,
        dailyBreakdown,
        alerts,
      },
    });
  } catch (error: any) {
    console.error("Budget summary error:", error);
    return NextResponse.json({ error: "Failed to calculate budget: " + error.message }, { status: 500 });
  }
}

function formatCurrencySimple(amount: number, currency: string) {
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Math.round(amount)}`;
}
