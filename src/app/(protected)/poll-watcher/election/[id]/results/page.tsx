/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Trophy,
  Users,
  UserCheck,
  UserX,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { markElectionAsOfficial } from "@/actions";
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
import { useReactToPrint } from "react-to-print";
import { ElectionStatus, User } from "@prisma/client";

// Skeleton loader
const SkeletonCard = () => (
  <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 space-y-4">
    <div className="h-6 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded" />
    <div className="h-4 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded" />
    <div className="h-3 w-full bg-zinc-300 dark:bg-zinc-700 rounded mt-2" />
  </div>
);

interface Candidate {
  id: string;
  user: { name: string };
  imageUrl: string;
  votes: any[];
}

interface Position {
  id: string;
  title: string;
  winnerCount: number;
  candidates: Candidate[];
  votes: any[];
}

interface Election {
  id: string;
  title: string;
  description: string;
  isOfficial: boolean;
  positions: Position[];
  votes: any[];
  status: ElectionStatus;
}

interface TurnoutStats {
  totalVoters: number;
  votedCount: number;
  notVotedCount: number;
  percentage: string;
}

const LiveResultsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchFullUser();
  }, []);

  const fetchFullUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  const [election, setElection] = useState<Election | null>(null);
  const [turnout, setTurnout] = useState<TurnoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMarkingOfficial, setIsMarkingOfficial] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchResults = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      else setRefreshing(true);

      const res = await fetch(`/api/elections/${electionId}/result`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();

      setElection(data.election);
      setTurnout(data.turnout);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults(true);
    const interval = setInterval(() => {
      fetchResults(false);
    }, 60000); // refresh every 1 minute
    return () => clearInterval(interval);
  }, [electionId]);

  const handlePrint = useReactToPrint({
    contentRef: printRef as React.RefObject<HTMLDivElement>,
    documentTitle: `${election?.title || "Election"} - Results Report`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          background: white !important;
          color: black !important;
        }
        .no-print {
          display: none !important;
        }
        .screen-view {
          display: none !important;
        }
        .print-header,
        .print-description,
        .print-stats,
        .print-position {
          display: block !important;
        }
        .hidden {
          display: block !important;
        }
        /* Show print content */
        .print-content {
          background: white !important;
          color: black !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 8px !important;
        }
        th {
          background: #f0f0f0 !important;
          font-weight: bold !important;
        }
        /* Hide decorative elements */
        svg, .lucide, [class*="icon"], img {
          display: none !important;
        }
        /* Simplify cards */
        .rounded-xl, .rounded-lg, .rounded-md, .rounded-full {
          border-radius: 0 !important;
        }
        /* Remove shadows and effects */
        .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl,
        .ring-1, .ring-2, .ring-4,
        .bg-gradient-to-r, .bg-linear-to-r {
          box-shadow: none !important;
          background: white !important;
        }
        /* Simplify colors */
        .bg-zinc-100, .bg-zinc-50, .bg-zinc-800, .bg-zinc-900,
        .bg-emerald-500, .bg-emerald-400, .bg-red-500 {
          background: white !important;
        }
        .text-emerald-500, .text-emerald-600, .text-red-500 {
          color: black !important;
        }
        /* Make borders visible */
        .border, .border-b {
          border: 1px solid #000 !important;
        }
        /* Remove animations */
        .animate-pulse, .animate-ping {
          animation: none !important;
        }
        /* Table-like layout */
        .print-table {
          display: table !important;
          width: 100% !important;
          border-collapse: collapse !important;
        }
        .print-row {
          display: table-row !important;
        }
        .print-cell {
          display: table-cell !important;
          padding: 8px !important;
          border: 1px solid #000 !important;
        }
        /* Ensure text is readable */
        h1, h2, h3, h4, h5, h6, p, span, div {
          color: black !important;
        }
        /* Page breaks */
        .page-break {
          page-break-after: always !important;
        }
      }
    `,
  });

  const handleMarkAsOfficial = async () => {
    if (!electionId) return;

    setIsMarkingOfficial(true);
    try {
      const result = await markElectionAsOfficial(electionId as string);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.success || "Election marked as official successfully"
        );
        // Refresh the results
        await fetchResults(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking election as official:", error);
      toast.error("Failed to mark election as official");
    } finally {
      setIsMarkingOfficial(false);
    }
  };

  if (loading || !election || !turnout || refreshing) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-8 space-y-4">
          <div className="h-8 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-6 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const positionResults = election.positions.map((position) => {
    const candidatesWithVotes = position.candidates.map((candidate) => ({
      ...candidate,
      voteCount: candidate.votes.length,
    }));

    const sortedCandidates = candidatesWithVotes.sort(
      (a, b) => b.voteCount - a.voteCount
    );

    const totalVotes = position.votes.length;
    return { position, candidates: sortedCandidates, totalVotes };
  });

  const userRole = (user as any)?.role || null;
  const canMarkAsOfficial =
    userRole === "COMELEC" || userRole === "POLL_WATCHER";
  const canMarkOfficial = canMarkAsOfficial && !election.isOfficial;

  return (
    <div>
      {/* Action Buttons - Not printed */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (!printRef.current) {
                toast.error(
                  "Content not ready for printing. Please try again."
                );
                return;
              }
              handlePrint();
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Results
          </Button>
        </div>
        {canMarkOfficial && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                disabled={isMarkingOfficial}
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Official
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark Election as Official</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to mark this election as official? This
                  action will:
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Set the election status to COMPLETED</li>
                    <li>Mark the results as official</li>
                    <li>
                      Make the results publicly visible with candidate names
                    </li>
                  </ul>
                  <strong className="mt-2 block text-foreground">
                    This action cannot be undone.
                  </strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isMarkingOfficial}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMarkAsOfficial}
                  disabled={isMarkingOfficial}
                >
                  {isMarkingOfficial ? "Marking..." : "Mark as Official"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="print-content">
        {/* Print Header - Hidden on screen, shown in print */}
        <div className="print-header mb-6 pb-4 border-b-2 border-black hidden">
          <h1 className="text-3xl font-bold mb-2">ELECTION RESULTS REPORT</h1>
          <h2 className="text-xl font-semibold mb-2">{election.title}</h2>
          <div className="text-sm space-y-1">
            <p>
              <strong>Status:</strong>{" "}
              {election.isOfficial
                ? "OFFICIAL RESULTS"
                : "UNOFFICIAL / PARTIAL RESULTS"}
            </p>
            {lastUpdated && (
              <p>
                <strong>Report Generated:</strong>{" "}
                {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Print Description - Hidden on screen, shown in print */}
        <div className="print-description mb-6 pb-4 border-b border-black hidden">
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: election.description }}
          />
        </div>

        {/* Print Statistics Table - Hidden on screen, shown in print */}
        <div className="print-stats mb-6 pb-4 border-b border-black hidden">
          <h3 className="text-lg font-bold mb-3">VOTER TURNOUT STATISTICS</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Metric</th>
                <th className="border border-black p-2 text-right">Count</th>
                <th className="border border-black p-2 text-right">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-medium">
                  Total Eligible Voters
                </td>
                <td className="border border-black p-2 text-right">
                  {turnout.totalVoters}
                </td>
                <td className="border border-black p-2 text-right">100.0%</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium">Voted</td>
                <td className="border border-black p-2 text-right">
                  {turnout.votedCount}
                </td>
                <td className="border border-black p-2 text-right">
                  {turnout.percentage}%
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium">
                  Not Voted
                </td>
                <td className="border border-black p-2 text-right">
                  {turnout.notVotedCount}
                </td>
                <td className="border border-black p-2 text-right">
                  {(
                    (turnout.notVotedCount / turnout.totalVoters) *
                    100
                  ).toFixed(1)}
                  %
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium">
                  Total Positions
                </td>
                <td className="border border-black p-2 text-right" colSpan={2}>
                  {election.positions.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Screen View (Hidden in Print) */}
        <div className="screen-view">
          {/* Header */}
          <Card className="mb-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-emerald-400 to-sky-400" />
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl">
                      Election Results
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {election.title}
                    </CardDescription>
                  </div>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-3 text-xs md:text-sm">
                  <Badge
                    variant={election.isOfficial ? "success" : "warning"}
                    className="uppercase tracking-wide"
                  >
                    {election.isOfficial
                      ? "Official results"
                      : "Unofficial / partial"}
                  </Badge>
                  {!election.isOfficial && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="font-medium">
                        Live results (auto-refresh every minute)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className="text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: election.description }}
              />
              {/* Statistics */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Total voters
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{turnout.totalVoters}</p>
                </div>
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Voted
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    {turnout.votedCount} ({turnout.percentage}%)
                  </p>
                  <Progress
                    value={parseFloat(turnout.percentage) || 0}
                    className="mt-3 h-2"
                  />
                </div>
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="mb-2 flex items-center gap-2">
                    <UserX className="h-5 w-5 text-red-500" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Not voted
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{turnout.notVotedCount}</p>
                </div>
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="mb-2 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Positions
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    {election.positions.length}
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  <span className="font-medium">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Print Position Results - Hidden on screen, shown in print */}
        {positionResults.map(
          ({ position, candidates, totalVotes }, posIndex) => {
            return (
              <div
                key={position.id}
                className={`print-position mb-6 hidden ${posIndex > 0 ? "mt-8 pt-6 border-t-2 border-black" : ""}`}
              >
                <h3 className="text-lg font-bold mb-3">
                  {position.title.toUpperCase()} - {position.winnerCount} Winner
                  {position.winnerCount > 1 ? "s" : ""}
                </h3>
                <p className="text-sm mb-3">Total Votes: {totalVotes}</p>
                {candidates.length === 0 ? (
                  <p className="py-4 text-center">
                    No candidates for this position
                  </p>
                ) : (
                  <table className="w-full border-collapse border border-black mb-4">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">
                          Rank
                        </th>
                        <th className="border border-black p-2 text-left">
                          Candidate Name
                        </th>
                        <th className="border border-black p-2 text-right">
                          Votes
                        </th>
                        <th className="border border-black p-2 text-right">
                          Percentage
                        </th>
                        <th className="border border-black p-2 text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map((candidate, index) => {
                        const votePercentage =
                          totalVotes > 0
                            ? (
                                (candidate.voteCount / totalVotes) *
                                100
                              ).toFixed(1)
                            : "0.0";
                        const isWinner = index < position.winnerCount;
                        const nameToShow = candidate.user.name;

                        return (
                          <tr
                            key={candidate.id}
                            className={isWinner ? "bg-gray-50" : ""}
                          >
                            <td className="border border-black p-2 text-center font-medium">
                              {index + 1}
                            </td>
                            <td className="border border-black p-2 font-medium">
                              {nameToShow}
                              {isWinner && (
                                <span className="ml-2 text-xs">(WINNER)</span>
                              )}
                            </td>
                            <td className="border border-black p-2 text-right">
                              {candidate.voteCount}
                            </td>
                            <td className="border border-black p-2 text-right">
                              {votePercentage}%
                            </td>
                            <td className="border border-black p-2 text-center">
                              {isWinner ? "WINNER" : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          }
        )}

        {/* Screen View Position Results (Hidden in Print) */}
        <div className="screen-view">
          {positionResults.map(({ position, candidates, totalVotes }) => {
            return (
              <Card
                key={position.id}
                className="mb-8 overflow-hidden border bg-white dark:bg-zinc-900"
              >
                <CardHeader className="border-b bg-zinc-50/80 dark:bg-zinc-800/80">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg md:text-2xl">
                        {position.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm">
                        <span>
                          {position.winnerCount} winner
                          {position.winnerCount > 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>{totalVotes} total votes</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                  {candidates.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No candidates for this position
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {candidates.map((candidate, index) => {
                        const votePercentage =
                          totalVotes > 0
                            ? (
                                (candidate.voteCount / totalVotes) *
                                100
                              ).toFixed(1)
                            : 0;

                        const displayName = election.isOfficial
                          ? candidate.user.name
                          : `Candidate ${String.fromCharCode(65 + index)}`;

                        const isWinner = index < position.winnerCount;
                        const nameToShow =
                          userRole === "POLL_WATCHER"
                            ? candidate.user.name
                            : displayName;

                        return (
                          <div
                            key={candidate.id}
                            className={`rounded-xl border bg-zinc-50 p-4 shadow-sm transition-all dark:bg-zinc-800 ${
                              isWinner
                                ? "border-emerald-500/70 ring-1 ring-emerald-500/40"
                                : "border-transparent"
                            }`}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                              <div className="flex items-center gap-4">
                                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-sm font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                                  {userRole === "POLL_WATCHER" ? (
                                    <Image
                                      src={candidate.imageUrl}
                                      alt={candidate.user.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-base font-semibold md:text-lg">
                                      {nameToShow}
                                    </h4>
                                    {isWinner && (
                                      <Badge
                                        variant={
                                          election.isOfficial
                                            ? "success"
                                            : "info"
                                        }
                                      >
                                        <Trophy className="mr-1 h-3 w-3" />
                                        {election.isOfficial
                                          ? "Winner"
                                          : "Leading"}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {candidate.voteCount} vote
                                    {candidate.voteCount !== 1
                                      ? "s"
                                      : ""} • {votePercentage}%
                                  </p>
                                </div>
                              </div>
                              <div className="flex-1 md:ml-auto">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Share of votes</span>
                                  <span className="font-medium text-foreground">
                                    {votePercentage}%
                                  </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                  <div
                                    className={`h-full rounded-full ${
                                      isWinner
                                        ? "bg-emerald-500"
                                        : "bg-red-500/80"
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {/* End of printable content */}
    </div>
  );
};

export default LiveResultsPage;
