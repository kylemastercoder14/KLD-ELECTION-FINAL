import db from "@/lib/db";
import ViewDetails from "./client";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const initialData = await db.party.findUnique({
    where: {
      id: params.id,
    },
    include: {
      applications: {
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
      head: {
        include: {
          candidate: {
            include: {
              position: true,
            },
          },
        },
      },
    },
  });

  console.log("HEAD DATA:", JSON.stringify(initialData?.head, null, 2));

  return (
    <div>
      <ViewDetails initialData={initialData} />
    </div>
  );
};

export default Page;
