import db from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { canUserVote } from "@/lib/voter-utils";
import { redirect } from "next/navigation";
import Heading from "@/components/heading";
import { User } from "@prisma/client";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import { syncElectionStatusesToNow } from "@/lib/election-status";

const Page = async () => {
  const session = await getServerSession();
  if (!session?.id) redirect("/auth/sign-in");

  const today = new Date();

  // Keep election.status in sync with its schedule before showing available elections
  await syncElectionStatusesToNow();
  const startOfToday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0,
      0,
      0
    )
  );

  const endOfToday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23,
      59,
      59
    )
  );
  const elections = await db.election.findMany({
    where: {
      isActive: true,
      campaignStartDate: { lte: endOfToday },
      campaignEndDate: { gte: startOfToday },
    },
    include: {
      createdByUser: true,
      positions: true,
      candidates: true
    },
  });

  const availableElections = elections.filter((election) =>
    canUserVote(session as User, election.voterRestriction)
  );
  return (
    <div>
      <Heading
        title="Available Elections"
        description="Browse elections you are eligible for and submit your candidacy for the upcoming positions."
      />
      <div className="mt-5">
        <DataTable columns={columns} data={availableElections} />
      </div>
    </div>
  );
};

export default Page;
