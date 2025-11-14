"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCcw,
  CheckCircle,
  XCircle,
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
import { User } from "@prisma/client";
import AlertModal from "@/components/alert-modal";
import { toast } from "sonner";
import { approveUser, archiveAccount, rejectUser } from "@/actions";

const CellActions = ({ user }: { user: User }) => {
  const router = useRouter();
  const [confirmState, setConfirmState] = React.useState<{
    action: "archive" | "approve" | "reject" | null;
    open: boolean;
  }>({ action: null, open: false });

  async function handleAction() {
    try {
      let response;

      if (confirmState.action === "archive") {
        response = await archiveAccount(user.id, user.isActive);
      } else if (confirmState.action === "approve") {
        response = await approveUser(user.id);
      } else if (confirmState.action === "reject") {
        response = await rejectUser(user.id);
      }

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response?.success ?? "Success");
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmState({ action: null, open: false });
    }
  }
  return (
    <>
      <AlertModal
        onConfirm={handleAction}
        title={
          confirmState.action === "approve"
            ? "Approve User"
            : confirmState.action === "reject"
              ? "Reject User"
              : user.isActive
                ? "Archive Account"
                : "Restore Account"
        }
        description="Are you sure? This action cannot be undone."
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ action: null, open: false })}
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
            onClick={() => router.push(`/admin/accounts/${user.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>

          {/* ---- APPROVE ---- */}
          {(user.status === "Pending" || user.status === "Rejected") && (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "approve", open: true })}
            >
              <CheckCircle className="size-4" />
              Approve
            </DropdownMenuItem>
          )}

          {/* ---- REJECT ---- */}
          {user.status === "Pending" && (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "reject", open: true })}
            >
              <XCircle className="size-4" />
              Reject
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {user.isActive ? (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "archive", open: true })}
            >
              <ArchiveIcon className="size-4" />
              Archive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "archive", open: true })}
            >
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
