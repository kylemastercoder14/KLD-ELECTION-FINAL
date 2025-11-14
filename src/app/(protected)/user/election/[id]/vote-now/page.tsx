import db from "@/lib/db";
import { notFound } from "next/navigation";
import Client from "./client";
import { syncElectionStatusesToNow } from "@/lib/election-status";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  await syncElectionStatusesToNow();

  const election = await db.election.findUnique({
    where: { id: params.id },
    include: {
      positions: {
        include: {
          candidates: {
            where: {
              status: "APPROVED",
              isActive: true,
            },
            include: {
              user: true,
              votes: true,
            },
          },
          votes: true,
        },
      },
      votes: true,
      createdByUser: true,
    },
  });

  if (!election) return notFound();

  return (
    <div>
      <Client election={election} />
    </div>
  );
};

export default Page;
