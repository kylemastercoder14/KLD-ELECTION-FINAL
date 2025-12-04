/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useTransition } from "react";
import { Election, Position, User } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addCandidateManually } from "@/actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";


type ElectionWithRelations = Election & {
  positions: Position[];
    candidates: Array<{
      id: string;
      userId: string;
      positionId: string;
      platform: string;
      imageUrl: string | null;
      status: string;
      user: Pick<User, "id" | "name" | "email" | "userId" | "image">;
      position: Position;
    }>;
};

interface Props {
  election: ElectionWithRelations;
  users: Array<Pick<User, "id" | "name" | "email" | "userId" | "userType">>;
}

export default function ManageCandidatesClient({ election, users }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});
  const [platforms, setPlatforms] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const handleOpenDialog = (positionId: string, open: boolean) => {
    setOpenDialogs((prev) => ({ ...prev, [positionId]: open }));
    if (!open) {
      // Reset form when closing
      setSelectedUsers((prev) => ({ ...prev, [positionId]: "" }));
      setPlatforms((prev) => ({ ...prev, [positionId]: "" }));
      setImageUrls((prev) => ({ ...prev, [positionId]: "" }));
    }
  };

  const handleAddCandidate = (positionId: string) => {
    const userId = selectedUsers[positionId];
    const platform = platforms[positionId] || "";
    const imageUrl = imageUrls[positionId] || "";

    if (!userId) {
      toast.error("Please select a user.");
      return;
    }

    if (!platform.trim()) {
      toast.error("Please provide a platform or achievements.");
      return;
    }

    startTransition(async () => {
      const result = await addCandidateManually(
        election.id,
        userId,
        positionId,
        platform,
        imageUrl || undefined
      );

      if (result.success) {
        toast.success(result.message);
        handleOpenDialog(positionId, false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const getCandidatesForPosition = (positionId: string) => {
    return election.candidates.filter((c) => c.positionId === positionId);
  };

  // Filter users based on election voter restriction and remove existing candidates
  const getAvailableUsers = () => {
    const candidateUserIds = new Set(election.candidates.map((c) => c.userId));
    return users.filter((user) => {
      if (candidateUserIds.has(user.id)) return false;

      const restriction = election.voterRestriction;

      if (restriction === "ALL") return true;

      if (restriction === "STUDENTS") return user.userType === "STUDENT";
      if (restriction === "FACULTY") return user.userType === "FACULTY";
      if (restriction === "NON_TEACHING") return user.userType === "NON_TEACHING";
      if (restriction === "STUDENTS_FACULTY")
        return user.userType === "STUDENT" || user.userType === "FACULTY";

      return true;
    });
  };

  const availableUsers = getAvailableUsers();

  return (
    <div className="space-y-6">
      {election.positions.map((position) => {
        const positionCandidates = getCandidatesForPosition(position.id);
        const hasCandidates = positionCandidates.length > 0;

        return (
          <Card key={position.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{position.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Winner Count: {position.winnerCount} | Candidates: {positionCandidates.length}
                  </p>
                </div>
                <Dialog
                  open={openDialogs[position.id] || false}
                  onOpenChange={(open) => handleOpenDialog(position.id, open)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={availableUsers.length === 0}>
                      <UserPlus className="size-4 mr-2" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-3xl!'>
                    <DialogHeader>
                      <DialogTitle>Add Candidate to {position.title}</DialogTitle>
                      <DialogDescription>
                        Select a user and provide their platform or achievements.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`user-${position.id}`}>
                          Select User <span className="text-destructive">*</span>
                        </Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Search user by name, ID, or email..."
                            value={searchTerms[position.id] || ""}
                            onChange={(e) =>
                              setSearchTerms((prev) => ({
                                ...prev,
                                [position.id]: e.target.value,
                              }))
                            }
                            disabled={isPending}
                          />
                          <div className="max-h-48 overflow-y-auto border rounded-md">
                            {availableUsers
                              .filter((user) => {
                                const term = (searchTerms[position.id] || "").toLowerCase();
                                if (!term) return true;
                                const haystack = `${user.name} ${user.userId || ""} ${
                                  user.email
                                }`.toLowerCase();
                                return haystack.includes(term);
                              })
                              .map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedUsers((prev) => ({
                                      ...prev,
                                      [position.id]: user.id,
                                    }))
                                  }
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted flex flex-col ${
                                    selectedUsers[position.id] === user.id
                                      ? "bg-muted"
                                      : ""
                                  }`}
                                  disabled={isPending}
                                >
                                  <span className="font-medium">
                                    {user.name}
                                    {user.userId && (
                                      <span className="text-muted-foreground ml-1">
                                        ({user.userId})
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </button>
                              ))}
                            {availableUsers.length === 0 && (
                              <p className="text-sm text-muted-foreground px-3 py-2">
                                All available users are already candidates in this election.
                              </p>
                            )}
                          </div>
                          {selectedUsers[position.id] && (
                            <p className="text-xs text-muted-foreground">
                              Selected user ID: {selectedUsers[position.id]}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`platform-${position.id}`}>
                          Platform or Achievements <span className="text-destructive">*</span>
                        </Label>
                        <RichTextEditor
                          value={platforms[position.id] || ""}
                          onChangeAction={(value) =>
                            setPlatforms((prev) => ({ ...prev, [position.id]: value }))
                          }
                          disabled={isPending}
                          placeholder="Enter platform or achievements..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`image-${position.id}`}>
                          Candidate Image <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <ImageUpload
                          onImageUpload={(url) =>
                            setImageUrls((prev) => ({ ...prev, [position.id]: url }))
                          }
                          defaultValue={imageUrls[position.id] || ""}
                          imageCount={1}
                          maxSize={4}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDialog(position.id, false)}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAddCandidate(position.id)}
                          disabled={isPending || !selectedUsers[position.id] || !platforms[position.id]?.trim()}
                        >
                          {isPending ? "Adding..." : "Add Candidate"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {hasCandidates ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={candidate.imageUrl || candidate.user.image || undefined}
                                alt={candidate.user.name}
                              />
                              <AvatarFallback>
                                {candidate.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{candidate.user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {candidate.user.email}
                                {candidate.user.userId && ` • ${candidate.user.userId}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate" dangerouslySetInnerHTML={{ __html: candidate.platform }} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              candidate.status === "APPROVED"
                                ? "success"
                                : candidate.status === "PENDING"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No candidates added yet. Click "Add Candidate" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

