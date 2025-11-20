"use client";

import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PartyWithCandidates } from "@/types/interface";

const CellActions = ({ partylist }: { partylist: PartyWithCandidates }) => {
  const router = useRouter();
  return (
    <>
      <Button
        size="sm"
        className='ml-2.5'
        onClick={() =>
          router.push(`/admin/party-list/${partylist.id}/view-details`)
        }
      >
        <FileTextIcon className="size-4" />
        View details
      </Button>
    </>
  );
};

export default CellActions;
