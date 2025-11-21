import Heading from "@/components/heading";
import db from "@/lib/db";

import { getServerSession } from "@/lib/get-session";
import { PartyWithStatus } from "@/types/interface";
import DataTableClient from "./_components/client";

const Page = async () => {
  const session = await getServerSession();
  const userId = session?.user?.id;

  const parties = await db.party.findMany({
    include: {
      applications: {
        where: { userId },
        include: {
          user: {
            include: {
              candidate: {
                include: {
                  position: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedParties: PartyWithStatus[] = parties.map((party) => ({
    ...party,
    hasApplied: party.applications.length > 0,
  }));

  const userHasApplied = formattedParties.some((p) => p.hasApplied);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Party List Applications"
          description="View all available party-lists you can apply to join. Submit your candidacy for approval by the COMELEC."
        />
      </div>
      <div className="mt-5">
        <DataTableClient
          parties={formattedParties}
          userHasApplied={userHasApplied}
        />
      </div>
    </div>
  );
};

export default Page;
