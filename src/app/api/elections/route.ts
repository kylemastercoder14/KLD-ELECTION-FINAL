import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import db from "@/lib/db";
import { ElectionStatus } from "@prisma/client";
import { syncElectionStatusesToNow } from "@/lib/election-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    // Ensure election.status reflects start/end dates before querying
    await syncElectionStatusesToNow();

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
        votes: {
          where: {
            voterId: session.id,
          },
          select: {
            voterId: true,
          },
        },
      },
    });

    const formatted = elections.map((election) => {
      const { votes, ...rest } = election;
      return {
        ...rest,
        hasVoted: votes.length > 0,
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error fetching elections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
