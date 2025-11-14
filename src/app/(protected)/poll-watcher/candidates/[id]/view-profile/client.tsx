/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { CandidateWithParty } from "@/types/interface";
import {
  ArrowLeft,
  Vote,
  Loader2,
  Badge as BadgeIcon,
  Building2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getStatusColor } from "@/lib/utils";

const ViewProfile = ({
  initialData,
}: {
  initialData: CandidateWithParty | null;
}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedPlatform, setExpandedPlatform] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    // simulate loading state (optional)
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  const togglePlatformExpansion = () => {
    setExpandedPlatform((prev) => !prev);
  };

  const shouldShowViewMore = (text: string) => {
    return text && text.length > 300;
  };

  if (loading) {
    return (
      <div className="flex items-center fixed inset-0 w-full z-50 justify-center h-screen bg-white">
        <Loader2 className="animate-spin size-12 text-primary" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidate Not Found
            </h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                The candidate profile you&apos;re looking for could not be
                found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Get the candidate’s approved or first party application
  const approvedApp =
    initialData.user.partyApplications.find((a) => a.status === "APPROVED") ||
    initialData.user.partyApplications[0];
  const party = approvedApp?.party || null;

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Candidate Profile
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="text-center p-4">
                <div>
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage
                      src={initialData.imageUrl || ""}
                      alt={initialData.user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {getInitials(initialData.user?.name || "Unknown")}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {initialData.user?.name || "Unknown Candidate"}
                  </h2>
                  {/* ✅ Position title from relation */}
                  <p className="text-lg text-gray-600">
                    {initialData.position?.title || "No Position Assigned"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ✅ Party Affiliation Card (from user.partyApplications) */}
            {party && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Party Affiliation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {party.logoUrl ? (
                      <img
                        src={party.logoUrl}
                        alt={`${party.name} logo`}
                        className="h-12 w-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(party.name)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {party.name}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Election Joined</span>
                  <span className="text-sm text-gray-700">
                    {initialData.election.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registered</span>
                  <span className="text-sm text-gray-700">
                    {new Date(initialData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-700">
                    {new Date(initialData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Platform & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Campaign Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                {initialData.platform ? (
                  <div className="space-y-4">
                    <div
                      className={`prose prose-lg max-w-none text-gray-700 leading-relaxed transition-all duration-200 ${
                        expandedPlatform ? "" : "line-clamp-6"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: initialData.platform,
                      }}
                    />
                    {shouldShowViewMore(initialData.platform) && (
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer bg-transparent border-none"
                        onClick={togglePlatformExpansion}
                      >
                        {expandedPlatform ? "View Less" : "View More"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No campaign platform provided yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BadgeIcon className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Personal Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Full Name:
                        </span>
                        <span className="text-sm text-gray-900">
                          {initialData.user?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Position:</span>
                        {/* ✅ Show related position title */}
                        <span className="text-sm text-gray-900">
                          {initialData.position?.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge
                          className={`text-xs ${getStatusColor(initialData.status)}`}
                          variant="outline"
                        >
                          {initialData.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
