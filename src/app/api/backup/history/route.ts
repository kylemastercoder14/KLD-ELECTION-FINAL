/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only superadmins can view backup history." },
        { status: 403 }
      );
    }

    // Fetch backup history with user information
    const history = await db.backupHistory.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 records
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Fetch history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup history", details: error.message },
      { status: 500 }
    );
  }
}
