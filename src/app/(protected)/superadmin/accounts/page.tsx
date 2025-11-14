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
import { UserRole } from "@prisma/client";

const Page = async () => {
  const data = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage User Accounts"
          description="Overview of all users. You can create, edit and delete the users."
        />
        <Button size="sm">
          <Link
            href="/superadmin/accounts/create"
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Create new account
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
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums">
                {data.filter((f) => f.isActive).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="bg-transparent data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
            >
              Inactive
              <Badge className="h-5 min-w-5 rounded-full px-1 text-black dark:text-white bg-accent tabular-nums">
                {data.filter((f) => !f.isActive).length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <DataTable
              columns={columns}
              data={data.filter((f) => f.isActive)}
              selectableFiltered={{
                title: "Filter by role",
                options: Object.values(UserRole).map((role) => ({
                  label: role,
                  value: role,
                })),
              }}
            />
          </TabsContent>
          <TabsContent value="inactive">
            <DataTable
              columns={columns}
              data={data.filter((f) => !f.isActive)}
              selectableFiltered={{
                title: "Filter by role",
                options: Object.values(UserRole).map((role) => ({
                  label: role,
                  value: role,
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
