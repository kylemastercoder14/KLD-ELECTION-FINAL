"use client";

import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CandidateWithParty } from "@/types/interface";

const CellAction = ({ candidate }: { candidate: CandidateWithParty }) => {
  const router = useRouter();
  return (
    <Button
      size="sm"
      className="ml-2.5"
      onClick={() =>
        router.push(`/admin/candidates/${candidate.id}/view-profile`)
      }
    >
      <FileTextIcon className="size-4" />
      View profile
    </Button>
  );
};

export default CellAction;
