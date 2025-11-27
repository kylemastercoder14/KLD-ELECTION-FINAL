"use client";

import React from "react";

import {
  FileTextIcon,
  MoreHorizontal,
  ArchiveIcon,
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
import { CandidateWithParty } from "@/types/interface";
import AlertModal from "@/components/alert-modal";
import { toast } from "sonner";
import { archiveCandidate } from "@/actions";

const CellAction = ({ candidate }: { candidate: CandidateWithParty }) => {
  const router = useRouter();
  const [openArchive, setOpenArchive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleArchive() {
    setLoading(true);
    try {
      const response = await archiveCandidate(candidate.id, candidate.isActive);
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      toast.success(
        response?.success ||
          (candidate.isActive
            ? "Candidate archived successfully."
            : "Candidate restored successfully.")
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update candidate. Please try again.");
    } finally {
      setLoading(false);
      setOpenArchive(false);
    }
  }

  return (
    <>
      <AlertModal
        isOpen={openArchive}
        onClose={() => setOpenArchive(false)}
        onConfirm={handleArchive}
        loading={loading}
        title={candidate.isActive ? "Archive Candidate" : "Restore Candidate"}
        description={
          candidate.isActive
            ? "Are you sure you want to archive this candidate? They will be hidden from active lists."
            : "Are you sure you want to restore this candidate?"
        }
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
            onClick={() =>
              router.push(`/comelec/candidates/${candidate.id}/view-profile`)
            }
          >
            <FileTextIcon className="size-4" />
            View profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenArchive(true)}>
            <ArchiveIcon className="size-4" />
            {candidate.isActive ? "Archive" : "Restore"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
