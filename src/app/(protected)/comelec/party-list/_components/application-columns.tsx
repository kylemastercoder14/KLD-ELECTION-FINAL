/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronsUpDown,
  CheckCircle2Icon,
  XCircleIcon,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { updatePartyApplicationStatus } from "@/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const ApplicationColumns: ColumnDef<any>[] = [
  {
    accessorKey: "user.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Applicant
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const user = row.original.user;
      return (
        <>
          <div className="flex items-center gap-2">
            <div className='flex flex-col'>
              <span className="font-medium">{user.name}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <Button
              variant="link"
              size="icon"
              className="p-0 cursor-pointer text-primary w-fit"
              onClick={() => setOpen(true)}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>

          {/* Applicant Details Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Applicant Details</DialogTitle>
              </DialogHeader>
              <div className="mt-2 space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                {user.contactNumber && (
                  <p>
                    <strong>Contact:</strong> {user.contactNumber}
                  </p>
                )}
                <p>
                  <strong>Applied Party:</strong> {row.original.party.name}
                </p>
                <p>
                  <strong>Status:</strong> {row.original.status}
                </p>
                <p>
                  <strong>Date Applied:</strong>{" "}
                  {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "party.name",
    header: "Party List",
    cell: ({ row }) => <span>{row.original.party.name}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={
          row.original.status === "PENDING"
            ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
            : row.original.status === "APPROVED"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Applied On",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter();
      const [loading, setLoading] = useState(false);

      async function handleAction(status: "APPROVED" | "REJECTED") {
        setLoading(true);
        try {
          const response = await updatePartyApplicationStatus(
            row.original.id,
            status
          );
          if (!response.success) {
            toast.error(response.message);
          } else {
            toast.success(response.message);
            router.refresh();
          }
        } catch {
          toast.error("Something went wrong.");
        } finally {
          setLoading(false);
        }
      }

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleAction("APPROVED")}
            className="border-green-600 cursor-pointer text-green-600 hover:bg-green-50"
          >
            <CheckCircle2Icon className="size-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleAction("REJECTED")}
            className="border-red-600 cursor-pointer text-red-600 hover:bg-red-50"
          >
            <XCircleIcon className="size-4 mr-1" />
            Reject
          </Button>
        </div>
      );
    },
  },
];
