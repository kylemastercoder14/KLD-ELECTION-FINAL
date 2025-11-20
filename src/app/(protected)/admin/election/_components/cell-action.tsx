"use client";

import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ElectionWithProps } from "@/types/interface";

const CellAction = ({ election }: { election: ElectionWithProps }) => {
  const router = useRouter();
  return (
    <>
      <Button
        size="sm"
        className="ml-2.5"
        onClick={() =>
          router.push(`/admin/election/${election.id}/view-details`)
        }
      >
        <FileTextIcon className="size-4" />
        View details
      </Button>
    </>
  );
};

export default CellAction;
