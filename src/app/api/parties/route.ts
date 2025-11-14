import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const parties = await db.party.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      }
    });
    return NextResponse.json(parties, { status: 200 });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
