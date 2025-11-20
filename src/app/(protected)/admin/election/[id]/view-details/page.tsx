import db from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { syncElectionStatusesToNow } from "@/lib/election-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusVariant } from "@/lib/utils";
import { format } from "date-fns";

const voterRestrictionLabels: Record<string, string> = {
  ALL: "All",
  STUDENTS: "Students Only",
  FACULTY: "Faculty Only",
  NON_TEACHING: "Non-Teaching",
  STUDENTS_FACULTY: "Students & Faculty",
};

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  await syncElectionStatusesToNow();

  const election = await db.election.findUnique({
    where: { id: params.id },
    include: {
      positions: true,
      createdByUser: true,
      candidates: true,
      votes: true,
    },
  });

  if (!election) return notFound();

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex-1">{election.title}</h1>
            <Badge
              variant={getStatusVariant(election.status)}
              className="capitalize text-base"
            >
              {election.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{election.description}</p>
        </CardHeader>
        <CardContent className="pt-2 space-y-6">
          <div className="grid gap-5 md:grid-cols-2 grid-cols-1">
            <div>
              <div className="font-semibold mb-1">Campaign Period</div>
              <div>
                {format(election.campaignStartDate ?? new Date(), "PPP")} -{" "}
                {format(election.campaignEndDate ?? new Date(), "PPP")}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Election Period</div>
              <div>
                {format(election.electionStartDate, "PPP")} -{" "}
                {format(election.electionEndDate, "PPP")}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Voter Restriction</div>
              <Badge variant="outline">
                {voterRestrictionLabels[election.voterRestriction]}
              </Badge>
            </div>
            <div>
              <div className="font-semibold mb-1">Created By</div>
              <span>{election.createdByUser?.name ?? "Unknown"}</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Total Candidates</div>
              <span>{election.candidates.length}</span>
            </div>
            <div>
              <div className="font-semibold mb-1">Total Votes</div>
              <span>{election.votes.length}</span>
            </div>
          </div>
          <div className="pt-6">
            <div className="font-semibold text-lg mb-2">Positions</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Winner Count</TableHead>
                  <TableHead>Candidates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {election.positions.map((pos, idx) => (
                  <TableRow key={pos.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{pos.title}</TableCell>
                    <TableCell>{pos.winnerCount}</TableCell>
                    <TableCell>
                      {
                        election.candidates.filter(
                          (c) => c.positionId === pos.id
                        ).length
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {election.positions.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">
                No positions defined.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
