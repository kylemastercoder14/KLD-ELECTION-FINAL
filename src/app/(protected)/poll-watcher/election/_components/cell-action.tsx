"use client";

import {
  BlocksIcon,
  FileTextIcon,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ElectionWithProps } from '@/types/interface';

const CellAction = ({ election }: { election: ElectionWithProps }) => {
  const router = useRouter();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-2.5">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/poll-watcher/election/${election.id}/view-details`)}>
            <FileTextIcon className="size-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/poll-watcher/election/${election.id}/results`)}>
            <BlocksIcon className="size-4" />
            View result
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
