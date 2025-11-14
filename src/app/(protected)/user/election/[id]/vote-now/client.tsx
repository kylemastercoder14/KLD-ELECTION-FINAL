/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  User,
  Eye,
  Clock,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';

interface PositionVote {
  candidateIds: string[];
  abstain: boolean;
}

interface VoteState {
  [positionId: string]: PositionVote;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CandidateWithRelations {
  id: string;
  userId: string;
  positionId: string;
  electionId: string;
  platform: string;
  imageUrl: string | null;
  status: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
    email: string;
  };
  votes: Array<{ id: string }>;
}

interface PositionWithCandidates {
  id: string;
  title: string;
  winnerCount: number;
  electionId: string;
  candidates: CandidateWithRelations[];
  votes: Array<{ id: string; candidateId: string }>;
}

interface ElectionWithRelations {
  id: string;
  title: string;
  description: string;
  electionStartDate: Date;
  electionEndDate: Date;
  status: string;
  positions: PositionWithCandidates[];
  votes: Array<{ id: string }>;
}

const Client = ({ election }: { election: ElectionWithRelations }) => {
  const router = useRouter();
  const [votes, setVotes] = useState<VoteState>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const getPositionVote = (positionId: string): PositionVote => {
    return votes[positionId] ?? { candidateIds: [], abstain: false };
  };

  // Countdown timer effect
  useEffect(() => {
    if (!election?.electionEndDate) return;

    const calculateTimeLeft = (): CountdownTime => {
      const endTime = new Date(election.electionEndDate).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    setCountdown(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [election?.electionEndDate]);

  const handleVote = (
    candidateId: string,
    positionId: string,
    winnerCount: number
  ) => {
    setVotes((prev) => {
      const current = getPositionVote(positionId);

      // If currently abstaining, turn it off when selecting a candidate
      const updated: PositionVote = {
        ...current,
        abstain: false,
      };

      const currentIds = updated.candidateIds;

      // Deselect candidate
      if (currentIds.includes(candidateId)) {
        return {
          ...prev,
          [positionId]: {
            ...updated,
            candidateIds: currentIds.filter((id) => id !== candidateId),
          },
        };
      }

      // Enforce winnerCount limit
      if (currentIds.length >= winnerCount) {
        toast.warning(
          `You can only select ${winnerCount} candidate${winnerCount > 1 ? "s" : ""} for this position.`
        );
        return prev;
      }

      return {
        ...prev,
        [positionId]: {
          ...updated,
          candidateIds: [...currentIds, candidateId],
        },
      };
    });
  };

  const handleAbstain = (positionId: string) => {
    setVotes((prev) => {
      const current = getPositionVote(positionId);
      const nextAbstain = !current.abstain;

      return {
        ...prev,
        [positionId]: {
          candidateIds: nextAbstain ? [] : current.candidateIds,
          abstain: nextAbstain,
        },
      };
    });
  };

  const buildVotesPayload = () => {
    const candidateVotes: Record<string, string[]> = {};
    const abstainPositions: string[] = [];

    if (!election) {
      return { candidateVotes, abstainPositions };
    }

    for (const position of election.positions) {
      const positionVote = votes[position.id];
      if (!positionVote) continue;

      if (positionVote.abstain) {
        abstainPositions.push(position.id);
      } else if (positionVote.candidateIds.length > 0) {
        candidateVotes[position.id] = positionVote.candidateIds;
      }
    }

    return { candidateVotes, abstainPositions };
  };

  const handleViewCandidate = (candidate: CandidateWithRelations): void => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleSubmitVotes = async (): Promise<void> => {
    if (!election?.id) return;

    setIsSubmitting(true);

    try {
      const { candidateVotes, abstainPositions } = buildVotesPayload();

      const response = await fetch(`/api/elections/${election.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ votes: candidateVotes, abstainPositions }),
      });

      if (response.ok) {
        toast.success("Votes submitted successfully!");
        router.push(`/user/election/${election.id}/results`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`Error submitting votes: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting votes:", error);
      toast.error("An error occurred while submitting your votes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPositionVoted = (
    positionId: string,
    winnerCount: number
  ): boolean => {
    const positionVote = votes[positionId];

    if (!positionVote) return false;
    if (positionVote.abstain) return true;

    return positionVote.candidateIds.length === winnerCount;
  };

  const isCandidateSelected = (
    candidateId: string,
    positionId: string
  ): boolean => {
    const positionVote = votes[positionId];
    if (!positionVote || positionVote.abstain) return false;

    return positionVote.candidateIds.includes(candidateId);
  };

  const getPositionVoteCount = (positionId: string): number => {
    const positionVote = votes[positionId];
    return positionVote ? positionVote.candidateIds.length : 0;
  };

  const getTotalVotesNeeded = (): number => {
    return election?.positions.length || 0;
  };

  const getTotalVotesCast = (): number => {
    if (!election) return 0;

    return election.positions.filter((position) => {
      const positionVote = votes[position.id];
      if (!positionVote) return false;
      if (positionVote.abstain) return true;
      return positionVote.candidateIds.length === position.winnerCount;
    }).length;
  };

  const canSubmitVotes = (): boolean => {
    return (
      getTotalVotesCast() === getTotalVotesNeeded() && getTotalVotesNeeded() > 0
    );
  };

  const formatCountdown = (time: CountdownTime): string => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  const isElectionEnded = (): boolean => {
    return (
      countdown.days === 0 &&
      countdown.hours === 0 &&
      countdown.minutes === 0 &&
      countdown.seconds === 0
    );
  };

  // Calculate vote counts for each candidate
  const getCandidateVoteCount = (candidate: CandidateWithRelations): number => {
    return candidate.votes.length;
  };

  // Get winners for a position
  const getPositionWinners = (
    position: PositionWithCandidates
  ): CandidateWithRelations[] => {
    const sortedCandidates = [...position.candidates].sort(
      (a, b) => getCandidateVoteCount(b) - getCandidateVoteCount(a)
    );
    return sortedCandidates.slice(0, position.winnerCount);
  };

  if (!election) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Election Not Found
          </h2>
          <p className="text-gray-500">
            The requested election could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow mb-8 overflow-hidden">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold mb-2">{election.title}</h1>
          <div
            className="text-muted-foreground text-sm mb-4"
            dangerouslySetInnerHTML={{ __html: election.description || "" }}
          />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                {isElectionEnded()
                  ? "Election Ended"
                  : `Time Left: ${formatCountdown(countdown)}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  election.status === "ONGOING" && !isElectionEnded()
                    ? "bg-primary"
                    : "bg-destructive"
                }`}
              ></div>
              <span className="capitalize text-xs">
                {isElectionEnded() ? "ENDED" : election.status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Voting Progress: {getTotalVotesCast()} of {getTotalVotesNeeded()}{" "}
              positions
            </span>
            <span className="text-sm">
              {getTotalVotesNeeded() > 0
                ? Math.round(
                    (getTotalVotesCast() / getTotalVotesNeeded()) * 100
                  )
                : 0}
              % complete
            </span>
          </div>
          <div className="w-full bg-zinc-400 dark:bg-zinc-600 rounded-full h-2">
            <div
              className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  getTotalVotesNeeded() > 0
                    ? (getTotalVotesCast() / getTotalVotesNeeded()) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Election Ended Message */}
      {isElectionEnded() && (
        <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow mb-8 p-6">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
            <span className="text-lg font-medium">
              This election has ended. No more votes can be cast.
            </span>
          </div>
        </div>
      )}

      {/* Voting Sections */}
      {election.positions.map((position) => (
        <div key={position.id} className="mb-8">
          <div className="dark:bg-zinc-900 bg-white border rounded-2xl shadow overflow-hidden">
            <div className="border-b px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold capitalize tracking-wide">
                    {position.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select {position.winnerCount} candidate
                    {position.winnerCount > 1 ? "s" : ""} • Selected:{" "}
                    {getPositionVoteCount(position.id)}/{position.winnerCount}
                    {position.votes.length > 0 &&
                      ` • ${position.votes.length} total votes cast`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isPositionVoted(position.id, position.winnerCount) && (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">
                        {getPositionVote(position.id).abstain
                          ? "Abstained"
                          : "Vote Cast"}
                      </span>
                    </div>
                  )}
                  <Button
                    variant={
                      getPositionVote(position.id).abstain
                        ? "destructive"
                        : "outline"
                    }
                    size="sm"
                    disabled={isElectionEnded()}
                    onClick={() => handleAbstain(position.id)}
                  >
                    {getPositionVote(position.id).abstain
                      ? "Cancel Abstain"
                      : "Abstain for this position"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {position.candidates.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No approved candidates for this position
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {position.candidates.map((candidate) => {
                    const voteCount = getCandidateVoteCount(candidate);
                    const winners = getPositionWinners(position);
                    const isWinner = winners.some((w) => w.id === candidate.id);
                    const isSelected = isCandidateSelected(
                      candidate.id,
                      position.id
                    );

                    return (
                      <div
                        key={candidate.id}
                        className={`relative bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                          isSelected ? "ring-4 ring-secondary" : ""
                        } ${
                          isWinner && isElectionEnded()
                            ? "ring-2 ring-yellow-500"
                            : ""
                        }`}
                      >
                        {/* Winner Badge */}
                        {isWinner && isElectionEnded() && (
                          <div className="absolute top-3 left-3">
                            <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              <Trophy className="w-3 h-3" />
                              WINNER
                            </div>
                          </div>
                        )}

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          </div>
                        )}

                        {/* Candidate Image */}
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                            {candidate.imageUrl || candidate.user?.image ? (
                              <img
                                src={
                                  candidate.imageUrl ||
                                  candidate.user.image ||
                                  ""
                                }
                                alt={candidate.user.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <User className="w-10 h-10 text-gray-400 dark:text-gray-300" />
                            )}
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-300 mb-1">
                            {candidate.user?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {position.title}
                          </p>
                          {/* Vote Count Display (only show if election ended) */}
                          {isElectionEnded() && (
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">
                                {voteCount} {voteCount === 1 ? "vote" : "votes"}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              handleVote(
                                candidate.id,
                                position.id,
                                position.winnerCount
                              )
                            }
                            disabled={isElectionEnded()}
                            className={`flex-1 ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-lg"
                                : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isSelected ? "VOTED" : "VOTE"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleViewCandidate(candidate)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            VIEW
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Submit Button */}
      {!isElectionEnded() && (
        <div className="dark:bg-zinc-900 bg-white rounded-2xl shadow border p-8">
          <div className="text-center">
            {!canSubmitVotes() && (
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">
                  Please cast your vote for all positions before submitting
                </span>
              </div>
            )}
            <Button
              onClick={handleSubmitVotes}
              disabled={!canSubmitVotes() || isSubmitting}
              className={`px-8 py-3 ${
                canSubmitVotes() && !isSubmitting
                  ? "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Submitting Votes..." : "Submit All Votes"}
            </Button>
          </div>
        </div>
      )}

      {showModal && selectedCandidate && (
        <Dialog modal open={showModal} onOpenChange={() => setShowModal(false)}>
          <DialogContent className="flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-2xl">
            <DialogHeader className="contents">
              <div className="flex items-center border-b p-6 gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedCandidate.imageUrl ||
                  selectedCandidate.user?.image ? (
                    <img
                      src={
                        selectedCandidate.imageUrl ||
                        selectedCandidate.user?.image ||
                        ""
                      }
                      alt={selectedCandidate.user?.name || ""}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-200">
                    {selectedCandidate.user?.name || ""}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {
                      election.positions.find(
                        (p) => p.id === selectedCandidate.positionId
                      )?.title
                    }
                  </p>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex max-h-full flex-col overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 mb-3">
                    Platform & Agenda
                  </h4>
                  <div
                    className="text-gray-600 dark:text-gray-400 space-y-4 prose prose-lg min-h-none leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedCandidate.platform,
                    }}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button onClick={() => setShowModal(false)}>Close</Button>
                  <Button
                    onClick={() => {
                      if (!isElectionEnded()) {
                        const position = election.positions.find(
                          (p) => p.id === selectedCandidate.positionId
                        );
                        if (position) {
                          handleVote(
                            selectedCandidate.id,
                            selectedCandidate.positionId,
                            position.winnerCount
                          );
                        }
                      }
                      setShowModal(false);
                    }}
                    disabled={isElectionEnded()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed ${
                      isCandidateSelected(
                        selectedCandidate.id,
                        selectedCandidate.positionId
                      )
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {isElectionEnded()
                      ? "Election Ended"
                      : isCandidateSelected(
                            selectedCandidate.id,
                            selectedCandidate.positionId
                          )
                        ? "Voted"
                        : "Vote"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Client;
