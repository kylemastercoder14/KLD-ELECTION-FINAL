import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import db from "@/lib/db";
import { columns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ElectionStatus } from "@prisma/client";

const Page = async () => {
  const elections = await db.election.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      positions: true,
      createdByUser: true,
      candidates: true
    },
  });

  const activeElections = elections.filter((e) => e.isActive);
  const archivedElections = elections.filter((e) => !e.isActive);
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Elections"
          description="Overview of all elections. You can create, edit, delete and change the status of elections."
        />
      </div>
      <div className="mt-5">
        <Tabs defaultValue="active" className="gap-4">
          <TabsList className="bg-transparent rounded-none border-b p-0">
            <TabsTrigger
              value="active"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Active
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums">
                {activeElections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Archived
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums">
                {archivedElections.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <DataTable
              columns={columns}
              data={activeElections}
              selectableFiltered={{
                title: "Filter by status",
                options: Object.values(ElectionStatus).map((status) => ({
                  label: status,
                  value: status,
                })),
              }}
            />
          </TabsContent>
          <TabsContent value="archived">
            <DataTable
              columns={columns}
              data={archivedElections}
              selectableFiltered={{
                title: "Filter by status",
                options: Object.values(ElectionStatus).map((status) => ({
                  label: status,
                  value: status,
                })),
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
