import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const take = isNaN(limit) || limit <= 0 ? 5 : limit;

    const logs = await db.systemLog.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: take,
      include: {
        user: true,
      },
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
