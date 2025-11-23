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
import { applyPartyAction, removePartyApplication } from "@/actions";
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

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removePartyApplication(party.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  // If user has applied to this specific party, show remove button
  if (party.hasApplied) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? "Removing..." : "Resign"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resign from {party.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your application from the <strong>{party.name}</strong> party-list?
              This action cannot be undone, but you can apply to another party after removing this application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? "Removing..." : "Confirm Resignation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Disable if the user already applied to any other party
  const isDisabled = isPending || userHasApplied;

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
              By confirming, you're applying to join the <strong>{party.name}</strong> party-list.
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
