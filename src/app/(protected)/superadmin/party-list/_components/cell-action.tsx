"use client";

import React from "react";

import {
  EditIcon,
  FileTextIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCcw,
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
import { PartyWithCandidates } from "@/types/interface";
import { archivePartyList } from "@/actions";
import { toast } from "sonner";
import AlertModal from "@/components/alert-modal";

const CellActions = ({ partylist }: { partylist: PartyWithCandidates }) => {
  const router = useRouter();
  const [openArchive, setOpenArchive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleArchive() {
    setLoading(true);
    try {
      const response = await archivePartyList(partylist.id, partylist.isActive);
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      toast.success(
        response?.success ||
          (partylist.isActive ? "Party list archived." : "Party list restored.")
      );
      router.refresh();
    } catch {
      toast.error("An error occurred. Please try again.");
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
        title={partylist.isActive ? "Archive Party list" : "Restore Party list"}
        description={
          partylist.isActive
            ? "Are you sure you want to archive this party list? This action can be undone."
            : "Are you sure you want to restore this party list?"
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
            onClick={() => router.push(`/superadmin/party-list/${partylist.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/superadmin/party-list/${partylist.id}/view-details`)
            }
          >
            <FileTextIcon className="size-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {partylist.isActive ? (
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

export default CellActions;
