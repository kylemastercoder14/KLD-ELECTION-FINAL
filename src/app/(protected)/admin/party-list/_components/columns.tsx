"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import CellAction from "./cell-action";
import { PartyWithCandidates } from "@/types/interface";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<PartyWithCandidates>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Party List
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const partylist = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={partylist.logoUrl || ""}
            />
            <AvatarFallback>{partylist.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold">{partylist.name}</span>
            <div
              title={partylist.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[200px] text-muted-foreground hover:underline truncate overflow-hidden whitespace-nowrap">
                {partylist.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(partylist.id || "");
                    toast.success("Party List ID copied to clipboard");
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
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "candidates",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          # of Candidates
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const candidates = row.original.applications;
      return <span className="ml-2.5">{candidates.length}</span>;
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
      const isActive = row.original.isActive;
      return (
        <Badge
          variant="default"
          className={`ml-3.5 ${
            isActive
              ? "bg-green-100 border border-green-600 text-green-600"
              : "bg-red-100 border border-red-600 text-red-600"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
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
        <span className="ml-2.5">{`${startDate.toLocaleDateString()}`}</span>
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
      return <CellAction partylist={actions} />;
    },
  },
];
