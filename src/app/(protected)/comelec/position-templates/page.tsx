import React from "react";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Page = async () => {
  const data = await db.positionTemplate.findMany({
    include: {
      items: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Position Templates"
          description="Create reusable position templates that can be used when creating elections. You can create, edit, and delete templates."
        />
        <Button size="sm">
          <Link
            href="/comelec/position-templates/create"
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Create new template
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <Tabs defaultValue="active" className="gap-4">
          <TabsList className="bg-transparent rounded-none border-b p-0">
            <TabsTrigger
              value="active"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Active
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {data.filter((f) => f.isActive).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Inactive
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums ml-2">
                {data.filter((f) => !f.isActive).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <DataTable
              columns={columns}
              data={data.filter((f) => f.isActive)}
            />
          </TabsContent>
          <TabsContent value="inactive">
            <DataTable
              columns={columns}
              data={data.filter((f) => !f.isActive)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;


