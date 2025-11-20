/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { PartyWithCandidates } from "@/types/interface";
import { ArrowLeft, Users, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getStatusColor } from "@/lib/utils";

const ViewDetails = ({
  initialData,
}: {
  initialData: PartyWithCandidates | null;
}) => {
  const router = useRouter();
  const [expandedPlatforms, setExpandedPlatforms] = React.useState<
    Record<string, boolean>
  >({});

  const togglePlatformExpansion = (candidateId: string) => {
    setExpandedPlatforms((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };

  const shouldShowViewMore = (text: string) => {
    // Check if text is longer than approximately 3 lines (roughly 150 characters)
    return text.length > 150;
  };

  if (!initialData) {
    return (
      <div className="p-6">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Party Not Found</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                The party list you&apos;re looking for could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Party Details</h1>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-5">
            {/* Party Information Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-6">
                  {/* Party Logo */}
                  <div className="shrink-0">
                    {initialData.logoUrl ? (
                      <img
                        src={initialData.logoUrl}
                        alt={`${initialData.name} logo`}
                        className="h-24 w-24 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {getInitials(initialData.name)}
                      </div>
                    )}
                  </div>

                  {/* Party Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">
                          {initialData.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {initialData.applications?.filter(
                                (f) => f.status === "APPROVED"
                              ).length || 0}{" "}
                              candidates
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created{" "}
                              {new Date(
                                initialData.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {initialData.description && (
                          <div
                            className="text-muted-foreground prose prose-lg space-y-4 leading-relaxed max-w-3xl"
                            dangerouslySetInnerHTML={{
                              __html: initialData.description || "",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* ------------------------ */}
            {/* HEAD / MANAGER ON TOP   */}
            {/* ------------------------ */}

            {initialData.head ? (
              <Card>
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={initialData.head?.image || ""}
                        alt={initialData.head?.name || "Head"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 text-white">
                        {getInitials(initialData.head?.name || "Head")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {initialData.head?.name}
                      </h3>

                      {/* Static Role Label */}
                      <p className="text-sm text-muted-foreground">
                        Head / Manager
                      </p>
                    </div>

                    <Badge
                      className="text-xs uppercase bg-green-100 text-green-800 border-green-200"
                      variant="outline"
                    >
                      APPROVED
                    </Badge>
                  </div>

                  {/* Fallback message if no candidate data */}
                  {!initialData.head?.candidate && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      No candidate profile available for this head.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-6 text-muted-foreground">
                  No head/manager assigned yet.
                </CardContent>
              </Card>
            )}

            {/* Candidates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidates (
                  {initialData.applications?.filter(
                    (f) => f.status === "APPROVED"
                  ).length || 0}
                  )
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[calc(100vh-250px)] p-0">
                {!initialData.applications ||
                initialData.applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base">
                      No candidates registered for this party yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col px-6 gap-6">
                    {initialData.applications.map((candidate) => (
                      <Card key={candidate.id} className="">
                        <CardContent>
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  candidate.user.image ||
                                  candidate.user.candidate?.imageUrl ||
                                  ""
                                }
                                alt={candidate.user?.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-linear-to-br from-blue-400 to-purple-500 text-white">
                                {getInitials(candidate.user?.name || "Unknown")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {candidate.user?.name || "Unknown Candidate"}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {candidate.user.position}
                              </p>
                            </div>
                            <Badge
                              className={`text-xs uppercase ${getStatusColor(
                                candidate.status
                              )}`}
                              variant="outline"
                            >
                              {candidate.status.toLowerCase()}
                            </Badge>
                          </div>

                          {candidate.user.candidate?.platform && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-1">
                                Platform:
                              </p>
                              <div
                                className={`text-sm leading-relaxed space-y-2 transition-all duration-200 ${
                                  expandedPlatforms[candidate.id]
                                    ? ""
                                    : "line-clamp-3"
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    candidate.user.candidate.platform || "",
                                }}
                              />
                              {shouldShowViewMore(
                                candidate.user.candidate.platform
                              ) && (
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium underline cursor-pointer bg-transparent border-none"
                                  onClick={() =>
                                    togglePlatformExpansion(candidate.id)
                                  }
                                >
                                  {expandedPlatforms[candidate.id]
                                    ? "View Less"
                                    : "View More"}
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Registered{" "}
                                  {new Date(
                                    candidate.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                router.push(
                                  `/admin/candidates/${candidate.id}/view-profile`
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;
