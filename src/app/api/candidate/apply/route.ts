import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/get-session";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { electionId, positionId, platform, photoUrl } = body;

  // Validation
  if (!photoUrl) {
    return NextResponse.json(
      { error: "Please upload a formal photo" },
      { status: 400 }
    );
  }
  if (!platform) {
    return NextResponse.json(
      { error: "Please provide your platform or achievements" },
      { status: 400 }
    );
  }

  // Check if election exists and campaign is ongoing
  const election = await db.election.findUnique({
    where: { id: electionId },
  });

  if (!election)
    return NextResponse.json({ error: "Election not found" }, { status: 404 });

  // Check if user already applied in this election
  const existingCandidate = await db.candidate.findFirst({
    where: { electionId, userId: session.user.id },
  });
  if (existingCandidate) {
    return NextResponse.json(
      { error: "You already applied for this election" },
      { status: 400 }
    );
  }

  // Create candidate
  const candidate = await db.candidate.create({
    data: {
      userId: session.user.id,
      electionId,
      positionId,
      platform,
      imageUrl: photoUrl,
    },
  });

  return NextResponse.json({ success: true, candidate });
}
