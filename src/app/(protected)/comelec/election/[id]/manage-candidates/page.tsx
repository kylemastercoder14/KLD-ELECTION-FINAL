import db from "@/lib/db";
import { notFound } from "next/navigation";
import Heading from "@/components/heading";
import ManageCandidatesClient from "./_components/client";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const [election, users] = await Promise.all([
    db.election.findUnique({
      where: { id: params.id },
      include: {
        positions: {
          orderBy: {
            createdAt: "asc",
          },
        },
        candidates: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userId: true,
                image: true,
              },
            },
            position: true,
          },
        },
      },
    }),
    db.user.findMany({
      where: {
        isActive: true,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        userId: true,
        userType: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!election) return notFound();

  if (!election.isSpecialized) {
    return (
      <div>
        <Heading
          title="Not a Specialized Election"
          description="Candidate management is only available for specialized elections."
        />
      </div>
    );
  }

  return (
    <div>
      <Heading
        title={`Manage Candidates: ${election.title}`}
        description="Add candidates manually to each position for this specialized election."
      />
      <div className="mt-5">
        <ManageCandidatesClient
          election={election}
          users={users}
        />
      </div>
    </div>
  );
};

export default Page;

