import db from "@/lib/db";
import { notFound } from "next/navigation";
import Client from "./client";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
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
