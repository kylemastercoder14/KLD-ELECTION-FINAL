import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { sendVoteToEmail } from "@/hooks/use-email-template";
import { syncElectionStatusesToNow } from "@/lib/election-status";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Get the logged-in user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const { votes, abstainPositions = [] } = await req.json();
    const { id: electionId } = await params;

    const abstainSet = new Set<string>(abstainPositions || []);

    // Keep election.status in sync with its schedule before any validation
    await syncElectionStatusesToNow();

    // Validate votes object
    if (!votes || typeof votes !== "object") {
      return NextResponse.json(
        { message: "Invalid votes data." },
        { status: 400 }
      );
    }

    // Check if election exists and is ongoing
    const election = await db.election.findUnique({
      where: { id: electionId },
      include: {
        positions: {
          include: {
            candidates: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      return NextResponse.json(
        { message: "Election not found." },
        { status: 404 }
      );
    }

    // Check if election is ongoing
    const now = new Date();
    const electionStart = new Date(election.electionStartDate);
    const electionEnd = new Date(election.electionEndDate);

    if (now < electionStart) {
      return NextResponse.json(
        { message: "Election has not started yet." },
        { status: 400 }
      );
    }

    if (now > electionEnd) {
      return NextResponse.json(
        { message: "Election has ended. No more votes can be cast." },
        { status: 400 }
      );
    }

    if (election.status !== "ONGOING") {
      return NextResponse.json(
        { message: "Election is not currently accepting votes." },
        { status: 400 }
      );
    }

    // Check voter restriction
    if (election.voterRestriction !== "ALL") {
      const userType = user.userType;
      const restriction = election.voterRestriction;

      const isEligible =
        (restriction === "STUDENTS" && userType === "STUDENT") ||
        (restriction === "FACULTY" && userType === "FACULTY") ||
        (restriction === "NON_TEACHING" && userType === "NON_TEACHING") ||
        (restriction === "STUDENTS_FACULTY" &&
          (userType === "STUDENT" || userType === "FACULTY"));

      if (!isEligible) {
        return NextResponse.json(
          {
            message: "You are not eligible to vote in this election.",
          },
          { status: 403 }
        );
      }
    }

    // Check if user has already voted in this election
    const existingVotes = await db.vote.findMany({
      where: {
        voterId: user.id,
        electionId: electionId,
      },
    });

    if (existingVotes.length > 0) {
      return NextResponse.json(
        { message: "You have already voted in this election." },
        { status: 400 }
      );
    }

    // Validate that all positions have votes
    const positionIds = election.positions.map((p) => p.id);
    const votedPositionIds = Object.keys(votes);

    const allHandled = positionIds.every(
      (id) => votedPositionIds.includes(id) || abstainSet.has(id)
    );

    if (!allHandled) {
      return NextResponse.json(
        { message: "Please vote or abstain for all positions." },
        { status: 400 }
      );
    }

    // Validate each vote and prepare vote records
    const voteRecords: Array<{
      voterId: string;
      candidateId: string;
      electionId: string;
      positionId: string;
    }> = [];

    const votedCandidatesForEmail: Array<{
      candidateName: string;
      positionTitle: string;
      candidateImage?: string;
      isAbstain?: boolean;
    }> = [];

    for (const [positionId, candidateIds] of Object.entries(votes)) {
      const position = election.positions.find((p) => p.id === positionId);

      if (!position) {
        return NextResponse.json(
          { message: `Invalid position ID: ${positionId}` },
          { status: 400 }
        );
      }

      // Check if candidateIds is an array
      if (!Array.isArray(candidateIds)) {
        return NextResponse.json(
          { message: `Invalid vote format for position: ${position.title}` },
          { status: 400 }
        );
      }

      // Check if the number of votes matches winnerCount
      if (candidateIds.length !== position.winnerCount) {
        return NextResponse.json(
          {
            message: `Please select exactly ${position.winnerCount} candidate(s) for ${position.title}`,
          },
          { status: 400 }
        );
      }

      // Validate each candidate
      for (const candidateId of candidateIds) {
        const candidate = position.candidates.find(
          (c) => c.id === candidateId && c.status === "APPROVED" && c.isActive
        );

        if (!candidate) {
          return NextResponse.json(
            {
              message: `Invalid or inactive candidate for position: ${position.title}`,
            },
            { status: 400 }
          );
        }

        // Add to vote records
        voteRecords.push({
          voterId: user.id,
          candidateId: candidateId,
          electionId: electionId,
          positionId: positionId,
        });

        // Collect data for email
        votedCandidatesForEmail.push({
          candidateName: candidate.user.name,
          positionTitle: position.title,
          candidateImage:
            candidate.imageUrl || candidate.user.image || undefined,
        });
      }
    }

    // Add abstain entries for positions where the voter chose to abstain
    for (const position of election.positions) {
      if (abstainSet.has(position.id)) {
        votedCandidatesForEmail.push({
          candidateName: "Abstained",
          positionTitle: position.title,
          candidateImage: undefined,
          isAbstain: true,
        });
      }
    }

    // Create all votes in a transaction
    await db.vote.createMany({
      data: voteRecords,
    });

    // Log the voting action
    await db.systemLog.create({
      data: {
        userId: user.id,
        action: "VOTE_CAST",
        details: `User voted in election: ${election.title}`,
      },
    });

    // Send confirmation email
    try {
      await sendVoteToEmail(
        user.email,
        user.name,
        election.title,
        votedCandidatesForEmail,
        new Date().toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        }),
        new Date(election.electionEndDate).toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })
      );
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the vote submission if email fails
    }

    return NextResponse.json(
      {
        message: "Votes submitted successfully!",
        votesCount: voteRecords.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting votes:", error);
    return NextResponse.json(
      { message: "An error occurred while submitting votes." },
      { status: 500 }
    );
  }
}
