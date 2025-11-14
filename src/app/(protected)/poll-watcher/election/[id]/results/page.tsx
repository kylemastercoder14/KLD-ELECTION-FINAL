/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Users, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
}

interface TurnoutStats {
  totalVoters: number;
  votedCount: number;
  notVotedCount: number;
  percentage: string;
}

const LiveResultsPage: React.FC = () => {
  const params = useParams();
  const electionId = params.id;
  const {data: session} = useSession()
  const [election, setElection] = useState<Election | null>(null);
  const [turnout, setTurnout] = useState<TurnoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  return (
    <div>
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
                {election.isOfficial ? "Official results" : "Unofficial / partial"}
              </Badge>
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium">
                  Live results (auto-refresh every minute)
                </span>
              </div>
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
              <p className="text-2xl font-bold">{election.positions.length}</p>
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

      {/* Position Results */}
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
                        ? ((candidate.voteCount / totalVotes) * 100).toFixed(1)
                        : 0;

                    const displayName = election.isOfficial
                      ? candidate.user.name
                      : `Candidate ${String.fromCharCode(65 + index)}`;

                    const isWinner = index < position.winnerCount;
                    const nameToShow =
                      session?.user.role === "POLL_WATCHER"
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
                              {session?.user.role === "POLL_WATCHER" ? (
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
                                      election.isOfficial ? "success" : "info"
                                    }
                                  >
                                    <Trophy className="mr-1 h-3 w-3" />
                                    {election.isOfficial ? "Winner" : "Leading"}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {candidate.voteCount} vote
                                {candidate.voteCount !== 1 ? "s" : ""} • {votePercentage}%
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
                                  isWinner ? "bg-emerald-500" : "bg-red-500/80"
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
  );
};

export default LiveResultsPage;
