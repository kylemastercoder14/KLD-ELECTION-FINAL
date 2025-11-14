import db from "@/lib/db";
import ViewProfile from "./client";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const initialData = await db.candidate.findUnique({
    where: {
      id: params.id,
    },
    include: {
      election: true,
      position: true,
      user: {
        include: {
          partyApplications: {
            include: {
              party: true,
            },
          },
        },
      },
      votes: true,
    },
  });

  return (
    <div>
      <ViewProfile initialData={initialData} />
    </div>
  );
};

export default Page;
