"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { applyPartyAction } from "@/actions";
import { PartyWithStatus } from "@/types/interface";

interface Props {
  party: PartyWithStatus;
  userHasApplied: boolean;
}

export default function ApplyPartyList({ party, userHasApplied }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyPartyAction(party.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Disable if the user already applied to any party OR if this party is currently applying
  const isDisabled = isPending || party.hasApplied || userHasApplied;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default" size="sm" disabled={isDisabled}>
          {userHasApplied ? "Already Applied" : "Apply Now"}
        </Button>
      </AlertDialogTrigger>

      {!userHasApplied && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply to {party.name}</AlertDialogTitle>
            <AlertDialogDescription>
              By confirming, you’re applying to join the <strong>{party.name}</strong> party-list.
              Your application will be reviewed and approved by COMELEC before becoming official.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApply} disabled={isPending}>
              {isPending ? "Submitting..." : "Confirm Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
