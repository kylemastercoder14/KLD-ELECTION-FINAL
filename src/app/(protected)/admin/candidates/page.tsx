import db from "@/lib/db";
import Heading from "@/components/heading";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CandidateStatus } from "@prisma/client";

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
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Candidates"
          description="Overview of all candidates. You can view the candidates and their details."
        />
      </div>
      <div className="mt-5">
        <Tabs defaultValue="all" className="gap-4">
          <TabsList className="bg-transparent rounded-none border-b p-0">
            <TabsTrigger
              value="all"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              All
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {candidates.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Pending
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {
                  candidates.filter((c) => c.status === CandidateStatus.PENDING)
                    .length
                }
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Approved
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {
                  candidates.filter(
                    (c) => c.status === CandidateStatus.APPROVED
                  ).length
                }
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Rejected
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {
                  candidates.filter(
                    (c) => c.status === CandidateStatus.REJECTED
                  ).length
                }
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <DataTable columns={columns} data={candidates} />
          </TabsContent>
          <TabsContent value="pending">
            <DataTable
              columns={columns}
              data={candidates.filter(
                (c) => c.status === CandidateStatus.PENDING
              )}
            />
          </TabsContent>
          <TabsContent value="approved">
            <DataTable
              columns={columns}
              data={candidates.filter(
                (c) => c.status === CandidateStatus.APPROVED
              )}
            />
          </TabsContent>
          <TabsContent value="rejected">
            <DataTable
              columns={columns}
              data={candidates.filter(
                (c) => c.status === CandidateStatus.REJECTED
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
