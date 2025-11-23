"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CandidacyApplication } from '@/types/interface';
import WithdrawCandidacy from './withdraw-candidacy';

export const columns: ColumnDef<CandidacyApplication>[] = [
  {
    accessorKey: "election.title",
    header: "Election",
  },
  {
    accessorKey: "position.title",
    header: "Applied Position",
  },
  {
    accessorKey: "party.name",
    header: "Party",
    cell: ({ row }) => row.original.party?.name || "Independent",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color =
        status === "APPROVED"
          ? "success"
          : status === "PENDING"
          ? "warning"
          : "destructive";
      return <Badge variant={color}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Applied",
    cell: ({ row }) => format(new Date(row.original.createdAt), "PPP"),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <WithdrawCandidacy candidacy={row.original} />;
    },
  },
];
