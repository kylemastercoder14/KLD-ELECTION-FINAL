/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { syncElectionStatusesToNow } from "@/lib/election-status";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await syncElectionStatusesToNow();

  const election = await db.election.findUnique({
    where: { id },
    include: {
      positions: {
        include: {
          candidates: { include: { user: true, votes: true } },
          votes: true,
        },
      },
      votes: true,
    },
  });

  if (!election) {
    return NextResponse.json({ error: "Election not found" }, { status: 404 });
  }

  // Build voter filter based on voterRestriction
  const userFilter: any = { role: "USER" };

  switch (election.voterRestriction) {
    case "STUDENTS":
      userFilter.userType = "STUDENT";
      break;
    case "FACULTY":
      userFilter.userType = "FACULTY";
      break;
    case "NON_TEACHING":
      userFilter.userType = "NON_TEACHING";
      break;
    case "STUDENTS_FACULTY":
      userFilter.OR = [{ userType: "STUDENT" }, { userType: "FACULTY" }];
      break;
    case "ALL":
    default:
      break; // no additional filtering
  }

  // Get all eligible voters
  const users = await db.user.findMany({
    where: userFilter,
    select: { id: true },
  });

  // Distinct voters who already cast votes
  const votersWhoVoted = Array.from(
    new Set(election.votes.map((v: any) => v.voterId))
  );

  const totalVoters = users.length;
  const votedCount = votersWhoVoted.length;
  const notVotedCount = totalVoters - votedCount;

  const turnout = {
    totalVoters,
    votedCount,
    notVotedCount,
    percentage:
      totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : "0",
  };

  return NextResponse.json({ election, turnout });
}
