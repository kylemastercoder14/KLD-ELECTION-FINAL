"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type GroupedVote = {
  electionTitle: string;
  dateVoted: Date;
  votes: {
    positionTitle: string;
    candidateName: string;
    isAbstain?: boolean;
  }[];
};

export const columns: ColumnDef<GroupedVote>[] = [
  {
    accessorKey: "electionTitle",
    header: "Election",
  },
  {
    accessorKey: "dateVoted",
    header: "Date Voted",
    cell: ({ row }) => row.original.dateVoted.toLocaleString(),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const votes = row.original.votes;
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="default">
              View Ballot
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ballot for {row.original.electionTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                Review your votes for this election.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-3 space-y-2">
              {votes.map((v, idx) => (
                <div key={idx} className="flex justify-between gap-4">
                  <span className="font-semibold">{v.positionTitle}:</span>
                  <span
                    className={v.isAbstain ? "italic text-red-600" : ""}
                  >
                    {v.isAbstain
                      ? "Abstained (no candidate selected)"
                      : v.candidateName}
                  </span>
                </div>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
