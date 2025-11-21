import db from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";

const Page = async () => {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const applications = await db.candidate.findMany({
    where: { userId: session.user.id },
    include: {
      election: true,
      position: true,
      user: {
        include: {
          partyApplications: {
            include: { party: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedApplications = applications.map((app) => ({
    ...app,
    party: app.user.partyApplications[0]?.party || null,
  }));

  return (
    <div>
      <Heading
        title="My Candidacy Applications"
        description="Review all your submitted applications for various elections. Each application is subject to COMELEC approval before becoming official."
      />
      <div className="mt-5">
        <DataTable columns={columns} data={formattedApplications} />
      </div>
    </div>
  );
};

export default Page;
