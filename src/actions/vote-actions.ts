"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { canUserVote } from "@/lib/voter-utils";
import { z } from "zod";

const VoteValidator = z.object({
  electionId: z.string().uuid(),
  positionId: z.string().uuid(),
  candidateId: z.string().uuid(),
});

/**
 * Submit a vote for a candidate in an election
 * This action enforces voter restrictions before allowing the vote
 */
export const submitVote = async (values: z.infer<typeof VoteValidator>) => {
  const session = await getServerSession(authOptions);

  try {
    // Check if user is logged in
    if (!session?.user?.id) {
      return { error: "You must be logged in to vote." };
    }

    // Validate input
    const validatedData = VoteValidator.parse(values);

    // Fetch the election with voter restriction
    const election = await db.election.findUnique({
      where: { id: validatedData.electionId },
      include: {
        positions: true,
        candidates: {
          where: { id: validatedData.candidateId },
        },
      },
    });

    if (!election) {
      return { error: "Election not found." };
    }

    // Check if election is currently ongoing
    const now = new Date();
    if (now < election.electionStartDate || now > election.electionEndDate) {
      return {
        error: "This election is not currently accepting votes.",
      };
    }

    // Check if position exists in this election
    const position = election.positions.find(
      (p) => p.id === validatedData.positionId
    );
    if (!position) {
      return {
        error: "Invalid position for this election.",
      };
    }

    // Check if candidate exists and is approved
    const candidate = election.candidates[0];
    if (!candidate) {
      return { error: "Candidate not found." };
    }
    if (candidate.status !== "APPROVED") {
      return { error: "Candidate is not approved for this election." };
    }

    // Fetch the user with full profile
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: "User not found." };
    }

    // ENFORCE VOTER RESTRICTION - This is the key check!
    if (!canUserVote(user, election.voterRestriction)) {
      return {
        error: `You are not eligible to vote in this election. This election is restricted to ${election.voterRestriction === "STUDENTS" ? "students only" : election.voterRestriction === "FACULTY" ? "faculty only" : election.voterRestriction === "NON_TEACHING" ? "non-teaching staff only" : "students and faculty only"}.`,
      };
    }

    // Check if user has already voted for this position
    const existingVote = await db.vote.findUnique({
      where: {
        voterId_electionId_positionId: {
          voterId: session.user.id,
          electionId: validatedData.electionId,
          positionId: validatedData.positionId,
        },
      },
    });

    if (existingVote) {
      return {
        error: "You have already voted for this position in this election.",
      };
    }

    // Create the vote
    const vote = await db.vote.create({
      data: {
        voterId: session.user.id,
        candidateId: validatedData.candidateId,
        electionId: validatedData.electionId,
        positionId: validatedData.positionId,
      },
    });

    return {
      success: "Vote submitted successfully!",
      data: vote,
    };
  } catch (error) {
    console.error("Vote submission error:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid vote data." };
    }
    return {
      error: "Failed to submit vote. Please try again.",
    };
  }
};


