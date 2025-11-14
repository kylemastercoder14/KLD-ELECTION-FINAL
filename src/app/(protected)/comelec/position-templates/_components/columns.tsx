"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import { PositionTemplate, PositionTemplateItem } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type PositionTemplateWithItems = PositionTemplate & {
  items: PositionTemplateItem[];
};

export const columns: ColumnDef<PositionTemplateWithItems>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Template Name
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const template = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <div>
            <span className="font-semibold">{template.name}</span>
            <div
              title={template.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[200px] text-muted-foreground hover:underline truncate overflow-hidden whitespace-nowrap">
                {template.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(template.id || "");
                    toast.success("Template ID copied to clipboard");
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
      const description = (row.original.description ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        id.includes(search) ||
        description.includes(search)
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "items",
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
      const items = row.original.items;
      return (
        <div className="ml-3.5 flex flex-wrap gap-1">
          {items.length > 0 ? (
            items.slice(0, 3).map((item) => (
              <Badge
                key={item.id}
                variant="outline"
                className="text-xs"
              >
                {item.title} ({item.winnerCount})
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">No positions</span>
          )}
          {items.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{items.length - 3} more
            </Badge>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.items.length - rowB.original.items.length;
    },
  },
  {
    accessorKey: "positionCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Position Count
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.original.items.length;
      return <span className="ml-3.5">{count}</span>;
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.items.length - rowB.original.items.length;
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
          Created
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
      const template = row.original;
      return <CellActions template={template} />;
    },
  },
];



