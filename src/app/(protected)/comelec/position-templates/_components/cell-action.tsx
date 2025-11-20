"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCcw,
  Trash2,
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
import { PositionTemplate, PositionTemplateItem } from "@prisma/client";
import AlertModal from "@/components/alert-modal";
import { toast } from "sonner";
import {
  deletePositionTemplate,
  togglePositionTemplateStatus,
} from "@/actions";

type PositionTemplateWithItems = PositionTemplate & {
  items: PositionTemplateItem[];
};

const CellActions = ({
  template,
}: {
  template: PositionTemplateWithItems;
}) => {
  const router = useRouter();
  const [confirmState, setConfirmState] = React.useState<{
    action: "delete" | "archive" | null;
    open: boolean;
  }>({ action: null, open: false });

  async function handleAction() {
    try {
      let response;

      if (confirmState.action === "archive") {
        response = await togglePositionTemplateStatus(
          template.id,
          template.isActive
        );
      } else if (confirmState.action === "delete") {
        response = await deletePositionTemplate(template.id);
      }

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response?.success ?? "Success");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setConfirmState({ action: null, open: false });
    }
  }

  return (
    <>
      <AlertModal
        onConfirm={handleAction}
        title={
          confirmState.action === "delete"
            ? "Delete Template"
            : template.isActive
              ? "Deactivate Template"
              : "Activate Template"
        }
        description={
          confirmState.action === "delete"
            ? "Are you sure you want to delete this template? This action cannot be undone."
            : `Are you sure you want to ${
                template.isActive ? "deactivate" : "activate"
              } this template?`
        }
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
            onClick={() => router.push(`/comelec/position-templates/${template.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {template.isActive ? (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "archive", open: true })}
            >
              <ArchiveIcon className="size-4" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setConfirmState({ action: "archive", open: true })}
            >
              <RefreshCcw className="size-4" />
              Activate
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => setConfirmState({ action: "delete", open: true })}
            className="text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;


