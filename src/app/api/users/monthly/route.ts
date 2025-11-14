import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5); // includes current + last 5
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch all users created in the last 6 months
    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
          lte: today,
        },
      },
      select: { createdAt: true },
    });

    // Map of YYYY-MM → count
    const monthMap = new Map<string, number>();

    // Initialize with 0 for each month
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthMap.set(key, 0);
    }

    // Count users into buckets
    users.forEach((u) => {
      const key = `${u.createdAt.getFullYear()}-${String(
        u.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        monthMap.set(key, monthMap.get(key)! + 1);
      }
    });

    // Convert to chart-friendly format
    const aggregatedData = Array.from(monthMap.entries()).map(
      ([key, count]) => {
        const [year, month] = key.split("-").map(Number);
        const monthName = new Date(year, month - 1).toLocaleString("en-US", {
          month: "short",
        });
        return { name: `${monthName} ${year % 100}`, users: count }; // e.g. "Aug 25"
      }
    );

    return NextResponse.json(aggregatedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching monthly user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
