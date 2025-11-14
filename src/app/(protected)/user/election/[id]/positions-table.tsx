"use client";

import { useState } from "react";
import { ElectionWithProps } from "@/types/interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageUpload from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useRouter } from "next/navigation";

interface Props {
  election: ElectionWithProps;
}

export default function PositionsTable({ election }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Check if the user has already applied for any position
  const userApplication = session?.user?.id
    ? election.candidates.find((c) => c.userId === session.user.id)
    : null;

  const handleSubmit = async () => {
    if (!session?.user?.id || !selectedPosition)
      return toast.error("Something went wrong");

    if (!photoUrl) return toast.error("Please upload a formal photo");
    if (!platform)
      return toast.error("Please enter your platform or achievements");

    setLoading(true);
    try {
      const res = await fetch("/api/candidate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electionId: election.id,
          positionId: selectedPosition,
          platform,
          photoUrl,
        }),
      });
      const data = await res.json();
      if (data.error) return toast.error(data.error);
      toast.success(
        "Application submitted! Please wait for COMELEC approval to be official in this position."
      );
      setSelectedPosition(null);
      setPlatform("");
      setPhotoUrl("");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Winner Count</TableHead>
          <TableHead>Official Candidates</TableHead>
          <TableHead>Action</TableHead>
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
                  (c) => c.positionId === pos.id && c.status === "APPROVED"
                ).length
              }
            </TableCell>
            <TableCell>
              {userApplication ? (
                // If user already applied, disable other positions
                userApplication.positionId === pos.id ? (
                  <Button disabled size="sm">
                    Applied
                  </Button>
                ) : (
                  <Button size="sm" disabled>
                    Apply
                  </Button>
                )
              ) : (
                // ✅ Allow applying to ANY position when user has no application
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setSelectedPosition(pos.id)}
                    >
                      Apply
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl!">
                    <DialogHeader>
                      <DialogTitle>Apply for {pos.title}</DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a formal photo (plain background, professional)
                        and provide your platform, achievements, or credentials.
                      </p>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={session?.user?.image ?? ""} />
                          <AvatarFallback>
                            {session?.user?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session?.user?.name}</span>
                      </div>

                      <div>
                        <label className="font-semibold mb-1 block">
                          Formal Photo
                        </label>
                        <ImageUpload
                          onImageUpload={(url) => setPhotoUrl(url)}
                          defaultValue={photoUrl}
                          imageCount={1}
                          maxSize={4}
                        />
                      </div>

                      <div>
                        <label className="font-semibold mb-1 block">
                          Platform / Achievements / Credentials
                        </label>
                        <RichTextEditor
                          value={platform}
                          onChangeAction={(val) => setPlatform(val)}
                          placeholder="Describe your platform, achievements, or credentials to campaign yourself"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button disabled={loading} onClick={handleSubmit}>
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
