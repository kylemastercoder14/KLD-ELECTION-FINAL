"use client";

import { DataTable } from "@/components/data-table";
import { PartyWithStatus } from "@/types/interface";
import { getColumns } from "./columns";

interface Props {
  parties: PartyWithStatus[];
  userHasApplied: boolean;
}

export default function DataTableClient({ parties, userHasApplied }: Props) {
  return <DataTable columns={getColumns(userHasApplied)} data={parties} />;
}
