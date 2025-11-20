import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import db from "@/lib/db";
import { columns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Page = async () => {
  const parties = await db.party.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  const activeParties = parties.filter((e) => e.isActive);
  const archivedParties = parties.filter((e) => !e.isActive);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Party-list"
          description="Overview of all party-lists and applications for this system."
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
                {activeParties.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Archived
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums">
                {archivedParties.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <DataTable columns={columns} data={activeParties} />
          </TabsContent>

          <TabsContent value="archived">
            <DataTable columns={columns} data={archivedParties} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
