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
import { withdrawCandidacy } from "@/actions";
import { CandidacyApplication } from "@/types/interface";

interface Props {
  candidacy: CandidacyApplication;
}

export default function WithdrawCandidacy({ candidacy }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = () => {
    startTransition(async () => {
      const result = await withdrawCandidacy(candidacy.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? "Withdrawing..." : "Withdraw"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw Candidacy</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to withdraw your candidacy for <strong>{candidacy.position.title}</strong> in the <strong>{candidacy.election.title}</strong> election?
            {candidacy.status === "APPROVED" && (
              <span className="block mt-2 text-destructive font-semibold">
                Your candidacy has been approved. Withdrawing will remove you from the election.
              </span>
            )}
            {candidacy.status === "PENDING" && (
              <span className="block mt-2">
                Your application is still pending approval. Withdrawing will cancel your application.
              </span>
            )}
            <span className="block mt-2">
              This action cannot be undone, but you can apply to another position after withdrawal.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleWithdraw} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending ? "Withdrawing..." : "Confirm Withdrawal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

