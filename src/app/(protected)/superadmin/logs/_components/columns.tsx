"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { SystemLogWithUser } from "@/types/interface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns: ColumnDef<SystemLogWithUser>[] = [
  {
    accessorKey: "user",
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
      const log = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);

      const name = log.user?.name ?? "Unknown";
      const image = log.user?.image ?? "";
      const initial = name.charAt(0);

      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage className="object-cover" src={image} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>

          <div>
            <span className="font-semibold">{name}</span>
            <div
              title={log.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[200px] hover:underline truncate overflow-hidden whitespace-nowrap">
                {log.id}
              </span>

              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(log.id ?? "");
                    toast.success("Log ID copied to clipboard");
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
      const name = (row.original.user?.name ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Action
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const action = row.original.action;
      return <span className="ml-2.5">{action}</span>;
    },
  },
  {
    accessorKey: "details",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Details
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const details = row.original.details;
      return <span className="ml-2.5 truncate w-60">{details}</span>;
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
          Date
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = new Date(row.original.timestamp);

      const formattedDate = timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return (
        <span className="ml-2.5">{`${formattedDate} ${formattedTime}`}</span>
      );
    },
  },
];
