import Heading from "@/components/heading";
import db from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/data-table";

type GroupedVote = {
  electionTitle: string;
  dateVoted: Date;
  votes: {
    positionTitle: string;
    candidateName: string;
    isAbstain?: boolean;
  }[];
};

const Page = async () => {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const votes = await db.vote.findMany({
    where: { voterId: session.user.id },
    include: {
      candidate: {
        include: {
          user: true,
        },
      },
      election: {
        include: {
          positions: true,
        },
      },
      position: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group votes by election and infer abstain choices per position
 const groupedVotes: GroupedVote[] = Object.values(
    votes.reduce(
      (
        acc: Record<
          string,
          {
            electionTitle: string;
            dateVoted: Date;
            votes: {
              positionId: string;
              positionTitle: string;
              candidateName: string;
              isAbstain?: boolean;
            }[];
            positions: { id: string; title: string }[];
          }
        >,
        vote
      ) => {
        const electionId = vote.electionId;
        if (!acc[electionId]) {
          acc[electionId] = {
            electionTitle: vote.election.title,
            dateVoted: vote.createdAt,
            votes: [],
            positions: vote.election.positions.map((p) => ({
              id: p.id,
              title: p.title,
            })),
          };
        }

        // Keep latest vote time per election
        if (vote.createdAt > acc[electionId].dateVoted) {
          acc[electionId].dateVoted = vote.createdAt;
        }

        acc[electionId].votes.push({
          positionId: vote.positionId,
          positionTitle: vote.position.title,
          candidateName: vote.candidate.user.name,
        });

        return acc;
      },
      {}
    )
  ).map((group) => {
    const allVotes: {
      positionTitle: string;
      candidateName: string;
      isAbstain?: boolean;
    }[] = [];

    // Follow the election's position order, like the email template
    for (const position of group.positions) {
      const votesForPosition = group.votes.filter(
        (v) => v.positionId === position.id
      );

      if (votesForPosition.length === 0) {
        // No vote record for this position => abstain
        allVotes.push({
          positionTitle: position.title,
          candidateName: "Abstained",
          isAbstain: true,
        });
      } else {
        for (const v of votesForPosition) {
          allVotes.push({
            positionTitle: v.positionTitle,
            candidateName: v.candidateName,
          });
        }
      }
    }

    return {
      electionTitle: group.electionTitle,
      dateVoted: group.dateVoted,
      votes: allVotes,
    } as GroupedVote;
  });

  return (
    <div>
      <Heading
        title="My Submitted Votes"
        description="Review all the votes you have submitted for elections."
      />

      <div className="mt-5">
        <DataTable columns={columns} data={groupedVotes} />
      </div>
    </div>
  );
};

export default Page;
