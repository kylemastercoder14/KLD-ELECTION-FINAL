
import db from "@/lib/db";
import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";

const Page = async () => {
  const candidates = await db.candidate.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      election: true,
      position: true,
      user: {
        include: {
          partyApplications: {
            include: {
              party: true
            }
          }
        }
      },
      votes: true,
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Candidates"
          description="Overview of all candidates. You can create, edit and delete the candidates."
        />
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={candidates} />
      </div>
    </div>
  );
};

export default Page;
