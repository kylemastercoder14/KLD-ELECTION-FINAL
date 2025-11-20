"use client";

import React from "react";

import {
  EditIcon,
  FileTextIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ElectionWithProps } from '@/types/interface';
import AlertModal from "@/components/alert-modal";
import { toast } from "sonner";
import { archiveElection, markElectionAsOfficial } from "@/actions";

const CellAction = ({ election }: { election: ElectionWithProps }) => {
  const router = useRouter();
  const [openArchive, setOpenArchive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [markOfficialOpen, setMarkOfficialOpen] = React.useState(false);
  const [markOfficialLoading, setMarkOfficialLoading] = React.useState(false);

  async function handleArchive() {
    setLoading(true);
    try {
      const response = await archiveElection(election.id, election.isActive);
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      toast.success(
        response?.success || (election.isActive ? "Election archived." : "Election restored.")
      );
      router.refresh();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setOpenArchive(false);
    }
  }

  async function handleMarkOfficial() {
    setMarkOfficialLoading(true);
    try {
      const response = await markElectionAsOfficial(election.id);
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      toast.success(response?.success || "Election marked as official.");
      router.refresh();
    } catch {
      toast.error("Failed to mark election as official. Please try again.");
    } finally {
      setMarkOfficialLoading(false);
      setMarkOfficialOpen(false);
    }
  }

  return (
    <>
      <AlertModal
        isOpen={openArchive}
        onClose={() => setOpenArchive(false)}
        onConfirm={handleArchive}
        loading={loading}
        title={election.isActive ? "Archive Election" : "Restore Election"}
        description={election.isActive ?
          "Are you sure you want to archive this election? This action can be undone." :
          "Are you sure you want to restore this election?"
        }
      />
      <AlertModal
        isOpen={markOfficialOpen}
        onClose={() => setMarkOfficialOpen(false)}
        onConfirm={handleMarkOfficial}
        loading={markOfficialLoading}
        title="Mark Election as Official"
        description="This will finalize the election results and set the status to completed. This action cannot be undone."
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-2.5">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/comelec/election/${election.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/comelec/election/${election.id}/view-details`)}>
            <FileTextIcon className="size-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!election.isOfficial && (
            <DropdownMenuItem onClick={() => setMarkOfficialOpen(true)}>
              <CheckCircle2 className="size-4" />
              Mark as official
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {election.isActive ? (
            <DropdownMenuItem onClick={() => setOpenArchive(true)}>
              <ArchiveIcon className="size-4" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenArchive(true)}>
              <RefreshCcw className="size-4" />
              Restore
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
