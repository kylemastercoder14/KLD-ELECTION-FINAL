import { notFound } from "next/navigation";
import db from "@/lib/db";
import { syncElectionStatusesToNow } from "@/lib/election-status";
import UserVoteClient from "@/app/(protected)/user/election/[id]/vote-now/client";

const Page = async (props: {
  params: Promise<{
    uniqueCode: string;
  }>;
}) => {
  const params = await props.params;
  const uniqueCode = params.uniqueCode;

  if (!uniqueCode) return notFound();

  await syncElectionStatusesToNow();

  const election = await db.election.findFirst({
    where: {
      uniqueCode,
      isActive: true,
      isSpecialized: true,
    },
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
    <div className='container py-10 mx-auto'>
      <UserVoteClient election={election} />
    </div>
  );
};

export default Page;
