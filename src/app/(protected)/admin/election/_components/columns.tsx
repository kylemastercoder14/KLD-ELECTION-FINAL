"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellAction from "./cell-action";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/lib/utils";
import { ElectionWithProps } from "@/types/interface";

export const columns: ColumnDef<ElectionWithProps>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Election
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const election = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex flex-col ml-2.5">
          <span className="font-semibold">{election.title}</span>
          <div
            title={election.id}
            className="text-xs cursor-pointer text-primary gap-2 flex items-center"
          >
            <span className="w-[200px] hover:underline truncate overflow-hidden whitespace-nowrap">
              {election.id}
            </span>
            {copied ? (
              <CheckIcon className="size-3 text-green-600" />
            ) : (
              <CopyIcon
                onClick={() => {
                  navigator.clipboard.writeText(election.id || "");
                  toast.success("Election ID copied to clipboard");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="size-3 text-muted-foreground cursor-pointer"
              />
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const name = (row.original.title ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "positions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Positions
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const positions = row.original.positions.length;
      return <span className="ml-2.5">{positions}</span>;
    },
  },
  {
    accessorKey: "campaignPeriod",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Campaign Period
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const start = row.original.campaignStartDate
        ? new Date(row.original.campaignStartDate)
        : null;
      const end = row.original.campaignEndDate
        ? new Date(row.original.campaignEndDate)
        : null;

      const startStr = start ? start.toLocaleDateString() : "-";
      const endStr = end ? end.toLocaleDateString() : "-";

      return <span className="ml-2.5">{`${startStr} - ${endStr}`}</span>;
    },
  },
  {
    accessorKey: "electionPeriod",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Election Period
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const startDate = new Date(row.original.electionStartDate);
      const endDate = new Date(row.original.electionEndDate);
      return (
        <span className="ml-2.5">{`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}</span>
      );
    },
  },
  {
    accessorKey: "voterRestriction",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Voter Restriction
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const restriction = row.original.voterRestriction;
      const displayMap: { [key: string]: string } = {
        ALL: "All",
        STUDENTS: "Students Only",
        FACULTY: "Faculty Only",
        NON_TEACHING: "Non-Teaching",
        STUDENTS_FACULTY: "Students & Faculty",
      };
      return (
        <span className="ml-2.5">{displayMap[restriction] || restriction}</span>
      );
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
          Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status: string = row.original.status;
      return (
        <Badge className="capitalize ml-2.5" variant={getStatusVariant(status)}>
          {status}
        </Badge>
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
      return <CellAction election={actions} />;
    },
  },
];
