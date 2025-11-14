import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import db from "@/lib/db";

const Page = async () => {
  const logs = await db.systemLog.findMany({
    orderBy: {
      timestamp: "desc",
    },
    include: {
      user: true,
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage System Logs"
          description="Overview of all system logs. You can view and manage the logs."
        />
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={logs} />
      </div>
    </div>
  );
};

export default Page;
