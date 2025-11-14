"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage className="object-cover" src={user.image || ""} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{user.name}</span>
            <div
              title={user.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[180px] hover:underline truncate overflow-hidden whitespace-nowrap">
                {user.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(user.id || "");
                    toast.success("User ID copied to clipboard");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="size-3 text-muted-foreground cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const name = (row.original.name ?? "").toLowerCase();
      const email = (row.original.email ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const userId = (row.original.userId ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        id.includes(search) ||
        email.includes(search) ||
        userId.includes(search)
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return <span className="ml-3.5">{email}</span>;
    },
  },
  {
    accessorKey: "studentId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student/Employee No.
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const studentNumber = row.original.userId;
      return <span className="ml-3.5">{studentNumber || "N/A"}</span>;
    },
  },
  {
    accessorKey: "selectableFiltered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role
        .replace(/_/g, " ") // replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize each word
      return <span className="ml-3.5">{role}</span>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status as "Approved" | "Pending" | "Rejected";

      const variants: Record<
        typeof status,
        { label: string; className: string }
      > = {
        Approved: {
          label: "Approved",
          className: "bg-green-100 border border-green-600 text-green-600",
        },
        Pending: {
          label: "Pending",
          className: "bg-yellow-100 border border-yellow-600 text-yellow-600",
        },
        Rejected: {
          label: "Rejected",
          className: "bg-red-100 border border-red-600 text-red-600",
        },
      };

      const current = variants[status] ?? variants["Pending"];

      return (
        <Badge
          variant="default"
          className={`ml-3.5 capitalize ${current.className}`}
        >
          {current.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Joined
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = new Date(row.original.createdAt);
      return (
        <span className="ml-3.5">{`${startDate.toLocaleDateString()}`}</span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Actions
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const actions = row.original;
      return <CellActions user={actions} />;
    },
  },
];
