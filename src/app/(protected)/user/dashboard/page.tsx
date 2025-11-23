/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Vote } from "lucide-react";
import { getStatusVariant } from "@/lib/utils";
import Link from "next/link";
import { canUserVote, getVoterRestrictionDescription } from "@/lib/voter-utils";
import { User } from "@prisma/client";
import { ChartPie } from "./_components/pie-chart";
import { ChartArea } from "./_components/area-chart";

interface Position {
  id: string;
  title: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  electionStartDate: string;
  electionEndDate: string;
  status: string;
  voterRestriction: string;
  positions: Position[];
  _count: {
    candidates: number;
    votes: number;
  };
  voters?: string[]; // list of user IDs who voted
  hasVoted?: boolean; // track if current user already voted
}

const Page = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullUser, setFullUser] = useState<User | null>(null);

  useEffect(() => {
    fetchFullUser();
  }, []);

  useEffect(() => {
    if (fullUser) fetchElections();
  }, [fullUser]);

  const fetchFullUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setFullUser(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchElections = async () => {
    try {
      const response = await fetch("/api/elections");
      const data: Election[] = await response.json();

      if (fullUser) {
        const updated = data.map((election) => {
          const userVoted = election.voters?.includes(fullUser.id) ?? false;
          return { ...election, hasVoted: userVoted };
        });
        setElections(updated);
      } else {
        setElections(data);
      }
    } catch (error) {
      console.error("Failed to fetch elections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter elections the user is eligible for
  const eligibleElections = elections.filter(
    (e) => fullUser && canUserVote(fullUser, e.voterRestriction as any)
  );

  const ongoingElections = eligibleElections.filter((e) => e.status === "ONGOING");
  const upcomingElections = eligibleElections.filter((e) => e.status === "UPCOMING");

  // Stats: only count eligible elections
  const votedCount = eligibleElections.filter((e) => e.hasVoted).length;
  const notVotedCount = eligibleElections.length - votedCount;

  const participationTrend = eligibleElections.map((e) => ({
    date: new Date(e.electionStartDate).toLocaleDateString(),
    voted: e.hasVoted ? 1 : 0,
  }));

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Elections
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eligibleElections.length}</div>
                <p className="text-xs text-muted-foreground">
                  Elections you&apos;re eligible for
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Votes Cast
                </CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{votedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Your votes cast
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Candidates
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {eligibleElections.reduce((sum, e) => sum + e._count.candidates, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across eligible elections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Elections
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {upcomingElections.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled to start soon
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <ChartPie
          data={[
            { name: "Voted", value: votedCount },
            { name: "Not Voted", value: notVotedCount },
          ]}
          colors={["#4ade80", "#f87171"]}
          title="Voting Status"
          description="Your votes vs remaining elections"
        />

        <ChartArea
          data={participationTrend}
          dataKey="voted"
          nameKey="date"
          title="Participation Trend"
          description="Your votes over active elections"
          color="#4ade80"
        />
      </div>

      {/* Active Elections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Active Elections</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : ongoingElections.length > 0 ? (
            ongoingElections.map((election) => {
              const eligible =
                fullUser &&
                canUserVote(fullUser, election.voterRestriction as any) &&
                !election.hasVoted;

              return (
                <Card
                  key={election.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      <Badge variant={getStatusVariant(election.status)}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div
                        dangerouslySetInnerHTML={{ __html: election.description }}
                      />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(election.electionStartDate).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(election.electionEndDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{election._count.candidates} candidates</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {election.positions
                            ?.map((p) => p.title)
                            .filter(Boolean)
                            .join(", ") || "No positions"}
                        </span>
                      </div>

                      <div className="pt-2">
                        <Button
                          asChild
                          className="w-full"
                          disabled={!eligible && !election.hasVoted}
                        >
                          <Link
                            href={
                              election.hasVoted
                                ? `/user/election/${election.id}/results`
                                : eligible
                                ? `/user/election/${election.id}/vote-now`
                                : "#"
                            }
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            {election.hasVoted
                              ? "View Live Result"
                              : eligible
                              ? "Vote Now"
                              : `Restricted: ${getVoterRestrictionDescription(
                                  election.voterRestriction as any
                                )}`}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-muted-foreground col-span-full">
              No active elections available for your user type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
