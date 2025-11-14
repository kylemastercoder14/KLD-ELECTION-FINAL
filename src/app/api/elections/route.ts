import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ElectionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const where: { status?: ElectionStatus } = {};

    if (statusParam) {
      const upperCaseStatus = statusParam.toUpperCase() as ElectionStatus;

      if (!Object.values(ElectionStatus).includes(upperCaseStatus)) {
        const validStatuses = Object.values(ElectionStatus).join(", ");
        return NextResponse.json(
          {
            error: `Invalid status parameter: ${statusParam}. Valid values are: ${validStatuses}`,
          },
          { status: 400 }
        );
      }

      where.status = upperCaseStatus;
    }

    const elections = await db.election.findMany({
      where,
      orderBy: {
        electionStartDate: "asc",
      },
      include: {
        positions: true,
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    });

    console.log(JSON.stringify(elections, null, 2));

    return NextResponse.json(elections, { status: 200 });
  } catch (error) {
    console.error("Error fetching elections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
