/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Calendar,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { upload } from "@/lib/upload";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface ProfileClientProps {
  profile: {
    id: string;
    email: string;
    username: string | null;
    password: string | null;
    image: string | null;
    userId: string | null;
    name: string;
    userType: "STUDENT" | "FACULTY" | "NON_TEACHING";
    year?: string | null;
    course?: string | null;
    section?: string | null;
    institute?: string | null;
    department?: string | null;
    position?: string | null;
    unit?: string | null;
    createdAt: Date;
    accounts: any[];
    sessions: any[];
    logs: any[];
  };
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    username: profile.username || "",
    image: profile.image || "",
    course: profile.course || "",
    year: profile.year || "",
    section: profile.section || "",
    institute: profile.institute || "",
    department: profile.department || "",
    position: profile.position || "",
    unit: profile.unit || "",
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const { url } = await upload(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      // Update profile image
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (!response.ok) throw new Error("Failed to update profile image.");

      setForm({ ...form, image: url });
      toast.success("Profile image updated successfully!");

      // Refresh the page to show new image
      router.refresh();
      // Session will auto-refresh with Better Auth
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to update profile.");

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // Refresh to show updated data
      router.refresh();
      // Session will auto-refresh with Better Auth
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update password.");
      }

      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Session will auto-refresh with Better Auth
    } catch (error: any) {
      toast.error(error?.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const renderUserMeta = () => {
    if (profile.userType === "STUDENT") {
      return profile.section && profile.year
        ? `${profile.section} (${profile.year})`
        : "No section and year provided";
    }
    if (profile.userType === "FACULTY") {
      return profile.position || "No position provided";
    }
    return profile.position || "No position provided";
  };

  const renderLocationMeta = () => {
    if (profile.userType === "STUDENT") {
      return profile.course || "No course provided";
    }
    if (profile.userType === "FACULTY") {
      return profile.institute || "No institute provided";
    }
    return profile.department || "No department provided";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* HEADER CARD */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={form.image || ""} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <Button
                size="icon"
                variant="outline"
                className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge variant="secondary">{profile.userType}</Badge>
              </div>

              <p className="text-muted-foreground">{renderUserMeta()}</p>

              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {renderLocationMeta()}
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {profile.createdAt
                    ? `Joined ${timeAgo(profile.createdAt)}`
                    : "Joined date not available"}
                </div>
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="default"
                onClick={() => {
                  setIsEditing(true);
                  setActiveTab("general");
                }}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="session">Sessions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Name
                      </label>
                      <p className="text-base mt-1">{profile.name || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Username
                      </label>
                      <p className="text-base mt-1">
                        {profile.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-base mt-1">{profile.email || "N/A"}</p>
                    </div>

                    {profile.userType === "STUDENT" && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Course
                          </label>
                          <p className="text-base mt-1">
                            {profile.course || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Year
                          </label>
                          <p className="text-base mt-1">
                            {profile.year || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Section
                          </label>
                          <p className="text-base mt-1">
                            {profile.section || "N/A"}
                          </p>
                        </div>
                      </>
                    )}

                    {profile.userType === "FACULTY" && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Institute
                          </label>
                          <p className="text-base mt-1">
                            {profile.institute || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Department
                          </label>
                          <p className="text-base mt-1">
                            {profile.department || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Position
                          </label>
                          <p className="text-base mt-1">
                            {profile.position || "N/A"}
                          </p>
                        </div>
                      </>
                    )}

                    {profile.userType === "NON_TEACHING" && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Department
                          </label>
                          <p className="text-base mt-1">
                            {profile.department || "N/A"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Unit
                          </label>
                          <p className="text-base mt-1">
                            {profile.unit || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <Input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                      />
                    </div>

                    {profile.userType === "STUDENT" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Course
                          </label>
                          <Select
                            value={form.course}
                            onValueChange={(value) =>
                              setForm({ ...form, course: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bachelor of Science in Information System">
                                Bachelor of Science in Information System
                              </SelectItem>
                              <SelectItem value="Bachelor of Science in Psychology">
                                Bachelor of Science in Psychology
                              </SelectItem>
                              <SelectItem value="Bachelor of Science in Engineering">
                                Bachelor of Science in Engineering
                              </SelectItem>
                              <SelectItem value="Bachelor of Science in Nursing">
                                Bachelor of Science in Nursing
                              </SelectItem>
                              <SelectItem value="Diploma in Midwifery">
                                Diploma in Midwifery
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Year
                          </label>
                          <Select
                            value={form.year}
                            onValueChange={(value) =>
                              setForm({ ...form, year: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st year">1st year</SelectItem>
                              <SelectItem value="2nd year">2nd year</SelectItem>
                              <SelectItem value="3rd year">3rd year</SelectItem>
                              <SelectItem value="4th year">4th year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Section
                          </label>
                          <Input
                            name="section"
                            value={form.section}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {profile.userType === "FACULTY" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Institute
                          </label>
                          <Input
                            name="institute"
                            value={form.institute}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Department
                          </label>
                          <Input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Position
                          </label>
                          <Input
                            name="position"
                            value={form.position}
                            onChange={handleChange}
                            placeholder="e.g., Professor II"
                          />
                        </div>
                      </>
                    )}

                    {profile.userType === "NON_TEACHING" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Department
                          </label>
                          <Input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Unit
                          </label>
                          <Input
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setForm({
                          name: profile.name || "",
                          email: profile.email || "",
                          username: profile.username || "",
                          image: profile.image || "",
                          course: profile.course || "",
                          year: profile.year || "",
                          section: profile.section || "",
                          institute: profile.institute || "",
                          department: profile.department || "",
                          position: profile.position || "",
                          unit: profile.unit || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-base mt-1">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      User ID
                    </label>
                    <p className="text-base mt-1">{profile.userId || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      User ID cannot be changed
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={isSavingPassword}
                  >
                    {isSavingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="session">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
              {profile.sessions && profile.sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">
                          Session Token
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Created
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Expires
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.sessions.map((session: any) => (
                        <tr key={session.id} className="border-b">
                          <td className="py-2 px-4">
                            <code className="text-xs">
                              {(session.token || session.sessionToken || "N/A").substring(0, 20)}
                              {(session.token || session.sessionToken) && "..."}
                            </code>
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {new Date(session.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {session.expiresAt
                              ? new Date(session.expiresAt).toLocaleString()
                              : session.expires
                              ? new Date(session.expires).toLocaleString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No active sessions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
              {profile.logs && profile.logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">
                          Action
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Details
                        </th>
                        <th className="text-left py-2 px-4 font-medium">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.logs.map((log: any) => (
                        <tr key={log.id} className="border-b">
                          <td className="py-2 px-4 text-sm font-medium">
                            {log.action}
                          </td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">
                            {log.details || "N/A"}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No activity logs</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
